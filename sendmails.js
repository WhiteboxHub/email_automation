const fs = require('fs');
const csv = require('csv-parser');
const { parse, stringify } = require('csv');
const nodemailer = require('nodemailer');
const readline = require('readline');
const path = require('path');
require('dotenv').config();
const htmlTemplate = require('./HTMLTemplate');

// Configuration
const DAILY_SENDING_LIMIT = 100;
const CANDIDATES_DIR = 'candidates';
const BATCH_FILE = './batch_emails.json';
const PROGRESS_FILE = './candidate_progress.json';
let emailsSentToday = 0;

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Utility functions
function TimeStamp() {
  const date = new Date();
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

function logError(message) {
  const time = TimeStamp();
  const logLine = `${time} - ${message}\n`;
  fs.appendFileSync('Sending_Reply_log.txt', logLine, (err) => {
    if (err) console.error('Error writing to log file:', err.message);
  });
}

function logToCSV(to, subject) {
  const csvLine = `${to},${subject},${TimeStamp()}\n`;
  fs.appendFileSync('succes_reply_log.csv', csvLine, (err) => {
    if (err) {
      console.error('Error writing to CSV file:', err.message);
      logError(`Error ${err}`);
    }
  });
}

// Check if email was already sent
async function isEmailAlreadySent(email) {
  return new Promise((resolve) => {
    if (!fs.existsSync('succes_reply_log.csv')) {
      resolve(false);
      return;
    }

    const stream = fs.createReadStream('succes_reply_log.csv')
      .pipe(csv())
      .on('data', (row) => {
        if (row.To === email) {
          stream.destroy(); // Stop reading if found
          resolve(true);
        }
      })
      .on('end', () => {
        resolve(false);
      })
      .on('error', () => {
        resolve(false);
      });
  });
}

// Remove email from unseen_emails.csv
function removeSentEmail(emailToRemove) {
  fs.readFile('unseen_emails.csv', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading CSV file:', err.message);
      return;
    }

    parse(data, { columns: true }, (err, records) => {
      if (err) {
        console.error('Error parsing CSV file:', err.message);
        return;
      }

      const updatedRecords = records.filter(record => record.Email !== emailToRemove);

      stringify(updatedRecords, { header: true }, (err, output) => {
        if (err) {
          console.error('Error stringifying CSV data:', err.message);
          return;
        }

        fs.writeFile('unseen_emails.csv', output, (err) => {
          if (err) {
            console.error('Error writing updated CSV file:', err.message);
          } else {
            console.log(`✅ Email ${emailToRemove} removed from unseen_emails.csv`);
          }
        });
      });
    });
  });
}

// Initialize required files and folders
function initializeFiles() {
  if (!fs.existsSync(CANDIDATES_DIR)) {
    fs.mkdirSync(CANDIDATES_DIR);
  }

  if (!fs.existsSync('succes_reply_log.csv')) {
    fs.writeFileSync('succes_reply_log.csv', 'To,Subject,SentAt\n');
  }
}

// Create or read batch
function createEmailBatch() {
  const emails = [];
  return new Promise((resolve) => {
    fs.createReadStream('unseen_emails.csv')
      .pipe(csv())
      .on('data', (row) => emails.push(row))
      .on('end', () => {
        const batch = emails.slice(0, DAILY_SENDING_LIMIT);
        fs.writeFileSync(BATCH_FILE, JSON.stringify(batch));
        resolve(batch);
      });
  });
}

function getBatch() {
  if (fs.existsSync(BATCH_FILE)) {
    return JSON.parse(fs.readFileSync(BATCH_FILE));
  }
  return createEmailBatch();
}

function initProgress(candidates) {
  const progress = {};
  candidates.forEach(c => {
    progress[c.id] = { completed: false };
  });
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress));
}

function markCandidateComplete(candidateId) {
  const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE));
  progress[candidateId].completed = true;
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress));

  if (Object.values(progress).every(p => p.completed)) {
    finalizeBatch();
  }
}

// Final cleanup if needed
function finalizeBatch() {
  if (!fs.existsSync(BATCH_FILE)) return;

  fs.unlinkSync(BATCH_FILE);
  if (fs.existsSync(PROGRESS_FILE)) {
    fs.unlinkSync(PROGRESS_FILE);
  }
  console.log('✅ Batch processed and cleaned up');
}

// Candidate selection logic
function getAvailableCandidates() {
  const files = fs.readdirSync(CANDIDATES_DIR);
  return files.filter(file => file.endsWith('.json')).map((file, index) => {
    const content = JSON.parse(fs.readFileSync(path.join(CANDIDATES_DIR, file), 'utf8'));
    return {
      id: index + 1,
      filename: file,
      name: content.name,
      email: content.email
    };
  });
}

function selectCandidate(callback) {
  const candidates = getAvailableCandidates();

  console.log('\nAvailable Candidates:');
  candidates.forEach(candidate => {
    console.log(`${candidate.id}. ${candidate.name} (${candidate.email})`);
  });

  rl.question('\nEnter the number of the candidate you want to use: ', (answer) => {
    const selectedId = parseInt(answer);
    const selectedCandidate = candidates.find(c => c.id === selectedId);

    if (!selectedCandidate) {
      console.log('Invalid selection. Please try again.');
      selectCandidate(callback);
      return;
    }

    rl.close();
    callback(selectedCandidate);
  });
}

// Email sending logic
async function sendEmailsFromBatch(candidate) {
  const batch = await getBatch();
  const user = JSON.parse(fs.readFileSync(path.join(CANDIDATES_DIR, candidate.filename), 'utf8'));

  console.log(`\nSending ${batch.length} emails for ${user.name}...`);
  sendEmailsInSequence(batch, user, candidate.id, 0);
}

async function sendEmailsInSequence(emails, user, candidateId, index) {
  if (index >= emails.length || emailsSentToday >= DAILY_SENDING_LIMIT) {
    console.log(`\n✅ Finished sending emails for ${user.name}`);
    markCandidateComplete(candidateId);
    return;
  }

  const email = emails[index];
  const alreadySent = await isEmailAlreadySent(email.Email);

  if (alreadySent) {
    console.log(`⚠️ Email already sent to ${email.Email} - Skipping...`);
    sendEmailsInSequence(emails, user, candidateId, index + 1);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user.email,
      pass: user.appPassword
    }
  });

  const mailOptions = {
    from: user.email,
    to: email.Email,
    inReplyTo: email.MessageID,
    references: email.MessageID,
    // subject: 'Profile of Experienced Professional Available for Opportunities',
    subject: 'Experienced Professional – Resume Attached',
    html: htmlTemplate(
      user.name,
      user.experience,
      user.skill,
      user.location,
      user.visa,
      user.resumeLink,
      user.phone,
      user.linkedin,
      user.email
    )
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      logError(`Error sending email to ${mailOptions.to} - ${error.message}`);
      console.error(`Error sending to ${mailOptions.to}:`, error.message);
    } else {
      logError(`Reply sent to: ${mailOptions.to}`);
      logToCSV(mailOptions.to, mailOptions.subject);
      removeSentEmail(mailOptions.to);
      console.log(`✅ Email ${index + 1}/${emails.length} sent to: ${mailOptions.to}`);
      emailsSentToday++;
    }

    setTimeout(() => {
      sendEmailsInSequence(emails, user, candidateId, index + 1);
    }, 1000);
  });
}

// Main Execution
initializeFiles();

if (!fs.existsSync(CANDIDATES_DIR) || getAvailableCandidates().length === 0) {
  console.log('Splitting users.json into individual candidate files...');
  const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
  users.forEach((user, index) => {
    const fileName = path.join(CANDIDATES_DIR, `candidate_${index + 1}_${user.name.replace(/\s+/g, '_')}.json`);
    fs.writeFileSync(fileName, JSON.stringify(user, null, 2));
  });
}

const candidates = getAvailableCandidates();
if (!fs.existsSync(PROGRESS_FILE)) {
  initProgress(candidates);
}

selectCandidate((selectedCandidate) => {
  sendEmailsFromBatch(selectedCandidate);
});
