📧 Automated Email Processing and Reply System
This project automates two key processes:

Fetching Unseen Emails (excluding common spam and no-reply domains)

Automatically Sending Replies to relevant emails using personalized candidate profiles

🔧 Prerequisites
Node.js installed

Gmail account with App Password enabled

.env file with email credentials of Marketing Manager 

users.json containing candidate data

HTML email template (HTMLTemplate.js)

📁 Project Structure
graphql
Copy
Edit
.
├── unseen_emails.csv         # Output CSV from IMAP script
├── succes_reply_log.csv      # Log of successfully sent replies
├── Sending_Reply_log.txt     # Log of errors and general activity
├── batch_emails.json         # Daily batch for email sending
├── candidate_progress.json   # Tracks batch progress
├── candidates/               # Individual candidate JSON profiles
├── users.json                # All candidate profiles
├── HTMLTemplate.js           # HTML template for email body
├── imap.js                   # Fetch unseen emails from Gmail
├── sendemails.js             # Reply to relevant unseen emails
└── .env                      # Stores Gmail credentials
📜 .env File
ini
Copy
Edit
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
✅ Setup Instructions
1. Install Dependencies
bash
Copy
Edit
npm install
2. Prepare .env
Add your Gmail credentials using App Passwords for security.

📥 1. Fetching Unseen Emails
Script: imap.js
This script:

Connects to Gmail using IMAP

Filters unseen emails from unwanted domains or keywords

Extracts sender email, subject, and message ID

Writes valid results to unseen_emails.csv

Run:
bash
Copy
Edit
node imap.js
📤 2. Sending Automated Replies
Script: sendemails.js
This script:

Prompts you to choose a candidate profile

Picks up to 100 unseen emails for the day

Sends personalized replies using the candidate's info and the HTMLTemplate

Logs successful replies and removes processed emails from unseen_emails.csv

Run:
bash
Copy
Edit
node sendemails.js
Email Sending Limits:
100 emails/day per run (can be changed in code via DAILY_SENDING_LIMIT)

🧑‍💼 users.json Format
json
Copy
Edit
[
  {
    "name": "John Doe",
    "email": "johndoe@gmail.com",
    "appPassword": "your-app-password",
    "experience": "5 years in ML",
    "genAI_exp": "2 years with GenAI",
    "linkedin": "https://linkedin.com/in/johndoe",
    "phone": "+1234567890"
  }
]
On first run, this will be split into individual JSON files under candidates/.

HTMLTemplate.js Format
Should export a function that returns HTML content:

js
Copy
Edit
module.exports = function(name, experience, genAI_exp, email, linkedin, phone) {
  return `
    <p>Hi,</p>
    <p>This is ${name}, with ${experience} of experience and hands-on work in GenAI (${genAI_exp}).</p>
    <p>Reach me at ${email}, or connect via <a href="${linkedin}">LinkedIn</a>.</p>
    <p>Phone: ${phone}</p>
  `;
};
Logs and Tracking

Sending_Reply_log.txt: All actions and errors

succes_reply_log.csv: Sent email logs

unseen_emails.csv: New unseen emails

batch_emails.json & candidate_progress.json: Batch management

