# Automated Email Response System

This project is designed to automate the extraction of unseen emails from an inbox, filter out non-relevant ones, and send personalized replies using multiple user profiles via Gmail. It also maintains logs for successful and failed email responses.

---

## ✨ Features

- **Fetch unseen emails** using IMAP protocol.
- **Filter emails** based on domain and keyword to avoid auto-generated messages.
- **Send customized replies** using an HTML email template.
- **Log successful replies** into a CSV file.
- **Log errors and statuses** in a log text file.
- **Automatically remove** already replied emails from the list.

---

## 📁 Project Structure

```bash
.
├── .env                  # Stores sensitive credentials
├── users.json            # List of user profiles to send emails from
├── unseen_emails.csv     # Stores fetched unseen emails to respond to
├── succes_reply_log.csv  # Logs successful email replies
├── Sending_Reply_log.txt # Logs errors and status messages
├── HTMLTemplate.js       # Generates HTML email content
├── sendmails.js          # Reads CSV and sends emails
├── test.js               # Fetches unseen emails and populates the CSV
├── package.json          # Node dependencies
```

---

## 🔧 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/WhiteboxHub/email_automation.git
cd email_automation
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` file

```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 4. Create `users.json`

```json
[
  {
    "name": "John Doe",
    "email": "john@example.com",
    "appPassword": "your_app_password",
    "experience": "5+ years",
    "skill": "Full Stack Development",
    "location": "San Francisco, CA",
    "visa": "H1B",
    "resumeLink": "https://link-to-resume.com",
    "phone": "123-456-7890",
    "linkedin": "https://linkedin.com/in/yourprofile"
  }
]
```

---

## ✅ Usage

### Fetch unseen emails

```bash
node test.js
```

### Send replies to extracted emails

```bash
node sendmails.js
```

---
