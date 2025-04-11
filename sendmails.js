
const fs = require('fs');
const csv = require('csv-parser');
const { parse, stringify } = require('csv');
const nodemailer = require('nodemailer');
require('dotenv').config();
const htmlTemplate = require('./HTMLTemplate');

// Load user details from JSON file
const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));

// Daily sending limit
const DAILY_SENDING_LIMIT = 2; 

// Start the process
const emails = [];
let emailsSentToday = 0;

function TimeStamp() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1; 
    const day = date.getDate();
    const hour = date.getHours(); 
    const min = date.getMinutes();
    const sec = date.getSeconds();
    return `${day}-${month}-${year} ${hour}:${min}:${sec}`;
}

function logError(message) {
    const time = TimeStamp();
    const logLine = `${time} - ${message} - \n`;
    fs.appendFileSync('Sending_Reply_log.txt', logLine, (err) => {
        if (err) {
            console.error('Error writing to log file:', err.message);
        }
    });
}

// Function to read the CSV file and send emails
function sendEmailsFromCSV() {
    console.log('Reading CSV file');
    fs.createReadStream('unseen_emails.csv')
        .pipe(csv())
        .on('data', (row) => {
            emails.push(row);
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
            sendEmails(emails, 0);
        });
}

// Create CSV file with headers if it doesn't exist
if (!fs.existsSync('succes_reply_log.csv')) {
    fs.writeFileSync('succes_reply_log.csv', 'To,Subject,SentAt\n');
}

// Function to store success reply in CSV file
function logToCSV(to, subject) {
    const csvLine = `${to},${subject},${TimeStamp()}\n`;
    fs.appendFileSync('succes_reply_log.csv', csvLine, (err) => {
        if (err) {
            console.error('Error writing to CSV file:', err.message);
            logError(`Error ${err}`);
        }
    });
}

// Function to send emails with a delay
function sendEmails(emails, index) {
    if (index >= emails.length || emailsSentToday >= DAILY_SENDING_LIMIT) {
        logError('All replies for today have been sent');
        console.log('All emails for today have been sent');
        return;
    }

    const email = emails[index];
    console.log(email);
    logError(`Sending reply to: ${email.Email}`);

    // Iterate over users and send emails
    users.forEach((user) => {
        if (emailsSentToday >= DAILY_SENDING_LIMIT) {
            return;
        }

        // Create a transporter for the specific user
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
            subject: 'Profile of Experienced Professional Available for Opportunities',
            html: htmlTemplate(
                user.name,
                user.experience,
                user.skill,
                user.location,
                user.visa,
                user.resumeLink,
                user.phone,
                user.linkedin,
                user.email // Pass the user's email here
            )
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                logError(`Error sending email from ${user.email} to ${mailOptions.to} - ${error.message}`);
                return console.log(error);
            }

            logError(`Reply sent from ${user.email} to: ${mailOptions.to}`);
            logToCSV(mailOptions.to, mailOptions.subject);
            console.log(`Email sent from ${user.email} to: ${mailOptions.to}`);

            emailsSentToday++;

            // Remove the successfully sent email from the CSV
            removeSentEmail(email.Email);
        });
    });

    // Delay before sending the next email
    setTimeout(() => {
        sendEmails(emails, index + 1);
    }, 1000); // 1-second delay between emails
}




// Function to remove sent email from the CSV file
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

            // Filter out the email that has been sent
            const updatedRecords = records.filter(record => record.Email !== emailToRemove);

            // Convert the updated records back to CSV format
            stringify(updatedRecords, { header: true }, (err, output) => {
                if (err) {
                    console.error('Error stringifying CSV data:', err.message);
                    return;
                }

                // Write the updated data back to the CSV file
                fs.writeFile('unseen_emails.csv', output, (err) => {
                    if (err) {
                        console.error('Error writing updated CSV file:', err.message);
                    }
                });
            });
        });
    });
}

sendEmailsFromCSV();
