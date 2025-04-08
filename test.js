// const Imap = require('imap');
// const { simpleParser } = require('mailparser');
// const fs = require('fs');
// require('dotenv').config();
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;
// const path = 'unseen_emails.csv';

// // const sendEmailsFromCSV = require('./sendmails');

// const imap = new Imap({
//   user: process.env.EMAIL_USER,
//   password: process.env.EMAIL_PASS,
//   host: 'imap.gmail.com',
//   port: 993,
//   tls: true,
//   tlsOptions: { rejectUnauthorized: false }
// });

// const filteredDomainsAndKeywords = [
//   'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com',
//   'icloud.com', 'aol.com', 'protonmail.com', 'zoho.com', 'gmx.com',
//   'notify', 'no-reply', 'noreply', 'donotreply', 'do-not-reply', 'automail','gmail.com','mail.com','googlemail.com','jobs-listings@linkedin.com'
//   ,'postmaster@logicplanet.com',"techfetch.com","applyonline@dice.com","Shiv.prasad@raasinfotek.com"
// ];

// function openInbox(cb) {
//   imap.openBox('INBOX', false, cb);
// }

// function filterEmails(email) {
//   const from = email.replyTo ? email.replyTo.value[0].address : email.from.value[0].address;
//   return !filteredDomainsAndKeywords.some(keyword => from.includes(keyword));
// }

// function fetchEmails() {
//   console.log('Fetching emails...');
//   imap.search(['UNSEEN'], (err, results) => {
//     if (err) throw err;

//     if (!results || !results.length) {
//       console.log('No unseen emails found');
//       imap.end();
//       return;
//     }

//     const f = imap.fetch(results, { bodies: '' });

//     f.on('message', (msg, seqno) => {
//       msg.on('body', stream => {
//         simpleParser(stream, (err, parsed) => {
//           if (err) throw err;

//           if (filterEmails(parsed)) {
//             const from = parsed.replyTo ? parsed.replyTo.value[0].address : parsed.from.value[0].address;
//             const emailRecord = {
//               email: from,
//               subject: parsed.subject,
//               messageid: parsed.messageId
//             };
//             writeEmailToCSV(emailRecord);
//           }
//         });
//       });

//       msg.once('attributes', attrs => {
//         // Mark the email as seen
//         imap.addFlags(attrs.uid, '\\Seen', err => {
//           if (err) {
//             console.error('Error marking email as seen:', err);
//           } else {
//             console.log(`Email ${seqno} marked as seen`);
//           }
//         });
//       });
//     });

//     f.once('end', () => {
//       console.log('Done fetching emails');
//       imap.end();
//     });
//   });
// }

// const csvWriter = createCsvWriter({
//   path,
//   header: [
//     { id: 'email', title: 'Email' },
//     { id: 'subject', title: 'Subject' },
//     { id: 'messageid', title: 'MessageID' }
//   ],
//   append: true // Append to the file instead of overwriting
// });

// function writeEmailToCSV(emailRecord) {
//   const isFileEmpty = !fs.existsSync(path) || fs.statSync(path).size === 0;

//   if (isFileEmpty) {
//     // Write headers if the file is empty or does not exist
//     const headerWriter = createCsvWriter({
//       path,
//       header: [
//         { id: 'email', title: 'Email' },
//         { id: 'subject', title: 'Subject' },
//         { id: 'messageid', title: 'MessageID' }
//       ],
//       append: false // Overwrite the file to write headers
//     });

//     headerWriter.writeRecords([]) // Writing empty records just to create the file with headers
//       .then(() => {
//         console.log('CSV headers written');
//         appendEmailRecord(emailRecord);
//       })
//       .catch(err => {
//         console.error('Error writing CSV headers:', err);
//       });
//   } else {
//     appendEmailRecord(emailRecord);
//   }
// }

// function appendEmailRecord(emailRecord) {
//   csvWriter.writeRecords([emailRecord])
//     .then(() => {
//       console.log('Email written to CSV:', emailRecord.email);
//     })
//     .catch(err => {
//       console.error('Error writing to CSV:', err);
//     });
// }

// imap.once('ready', () => {
//   openInbox((err, box) => {
//     if (err) throw err;
//     fetchEmails();
//   });
// });

// imap.once('error', err => {
//   console.error(err);
// });

// imap.once('end', () => {
//   console.log('Connection ended');
//   // sendEmailsFromCSV();
// });

// imap.connect();



const Imap = require('imap');
const { simpleParser } = require('mailparser');
const fs = require('fs');
require('dotenv').config();
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = 'unseen_emails.csv';

const imap = new Imap({
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASS,
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

const filteredDomainsAndKeywords = [
  'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com',
  'icloud.com', 'aol.com', 'protonmail.com', 'zoho.com', 'gmx.com',
  'notify', 'no-reply', 'noreply', 'donotreply', 'do-not-reply', 'automail', 'gmail.com', 'mail.com', 'googlemail.com',
  'jobs-listings@linkedin.com', 'postmaster@logicplanet.com', 'techfetch.com', 'applyonline@dice.com', 'Shiv.prasad@raasinfotek.com'
];

function openInbox(cb) {
  imap.openBox('INBOX', false, cb);
}

function getSenderAddress(email) {
  if (email.replyTo && email.replyTo.value && email.replyTo.value.length > 0) {
    return email.replyTo.value[0].address;
  }
  if (email.from && email.from.value && email.from.value.length > 0) {
    return email.from.value[0].address;
  }
  return null;
}

function filterEmails(email) {
  const from = getSenderAddress(email);
  if (!from) return false;

  return !filteredDomainsAndKeywords.some(keyword => from.includes(keyword));
}

function fetchEmails() {
  console.log('Fetching emails...');
  imap.search(['UNSEEN'], (err, results) => {
    if (err) throw err;

    if (!results || !results.length) {
      console.log('No unseen emails found');
      imap.end();
      return;
    }

    const f = imap.fetch(results, { bodies: '' });

    f.on('message', (msg, seqno) => {
      msg.on('body', stream => {
        simpleParser(stream, (err, parsed) => {
          if (err) throw err;

          if (filterEmails(parsed)) {
            const from = getSenderAddress(parsed);
            if (!from) {
              console.warn('Skipping email with no sender address.');
              return;
            }

            const emailRecord = {
              email: from,
              subject: parsed.subject,
              messageid: parsed.messageId
            };
            writeEmailToCSV(emailRecord);
          }
        });
      });

      msg.once('attributes', attrs => {
        imap.addFlags(attrs.uid, '\\Seen', err => {
          if (err) {
            console.error('Error marking email as seen:', err);
          } else {
            console.log(`Email ${seqno} marked as seen`);
          }
        });
      });
    });

    f.once('end', () => {
      console.log('Done fetching emails');
      imap.end();
    });
  });
}

const csvWriter = createCsvWriter({
  path,
  header: [
    { id: 'email', title: 'Email' },
    { id: 'subject', title: 'Subject' },
    { id: 'messageid', title: 'MessageID' }
  ],
  append: true
});

// function writeEmailToCSV(emailRecord) {
//   const isFileEmpty = !fs.existsSync(path) || fs.statSync(path).size === 0;

//   if (isFileEmpty) {
//     const headerWriter = createCsvWriter({
//       path,
//       header: [
//         { id: 'email', title: 'Email' },
//         { id: 'subject', title: 'Subject' },
//         { id: 'messageid', title: 'MessageID' }
//       ],
//       append: false
//     });

//     headerWriter.writeRecords([])
//       .then(() => {
//         console.log('CSV headers written');
//         appendEmailRecord(emailRecord);
//       })
//       .catch(err => {
//         console.error('Error writing CSV headers:', err);
//       });
//   } else {
//     appendEmailRecord(emailRecord);
//   }
// }



function writeEmailToCSV(emailRecord) {
  const isFileEmpty = !fs.existsSync(path) || fs.statSync(path).size === 0;

  if (isFileEmpty) {
    // Write headers and the first record directly
    const headerWriter = createCsvWriter({
      path,
      header: [
        { id: 'email', title: 'Email' },
        { id: 'subject', title: 'Subject' },
        { id: 'messageid', title: 'MessageID' }
      ],
      append: false // Overwrite the file to write headers
    });

    headerWriter.writeRecords([emailRecord]) // Write header + first row
      .then(() => {
        console.log('CSV headers and first row written');
      })
      .catch(err => {
        console.error('Error writing CSV headers:', err);
      });
  } else {
    appendEmailRecord(emailRecord);
  }
}

function appendEmailRecord(emailRecord) {
  csvWriter.writeRecords([emailRecord])
    .then(() => {
      console.log('Email written to CSV:', emailRecord.email);
    })
    .catch(err => {
      console.error('Error writing to CSV:', err);
    });
}

imap.once('ready', () => {
  openInbox((err, box) => {
    if (err) throw err;
    fetchEmails();
  });
});

imap.once('error', err => {
  console.error(err);
});




imap.once('error', err => {
  if (err.code === 'ECONNRESET') {
    console.warn('IMAP connection reset by server (probably safe to ignore)');
  } else {
    console.error('IMAP error:', err);
  }
});

imap.connect();