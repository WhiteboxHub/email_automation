

const htmlTemplate = (name, experience, skill, location, visa, resumeLink, phone, linkedin, email) => `
<p>Hello, Dear [Reciepent's name] </p>
<p>I hope this message finds you well</p>
<p> My name is ${name} and, I am experienced in ${skill} with ${experience}. I am excited to share my profile with you. I have work authorization and am ready to contribute. I am available for <strong style="color:darkblue">C2C and C2H with fulltime W2 opportunities</strong>.</p>
<p>I do not require visa sponsorship as I hold a <strong style="color:darkblue">${visa} status</strong>.</p>
<p>If my this aligns with your current needs, please don't hesitate to reach out. Additionally, I would appreciate it if you could add my email to your daily distribution list:
    <strong style="color:darkblue"><a href="mailto:${email}">${email}</a></strong>. Feel free to call me at <strong style="color:darkblue">${phone}</strong> or connect on <a href="${linkedin}">LinkedIn</a> for any further discussions.</p>
<p>Best regards,</p>
<p>${name}</p>
<html lang="en">
<head>
    <title>Profile Information</title>
    <style>
        table {
            border: none;
            background-color: #b0d9e6;
        }
        th {
            background-color: darkblue;
            color: white;
            padding: 8px;
            text-align: left;
        }
        td {
            border: 1px solid #7c7878;
            padding: 8px;
            text-align: left;
        }
    </style>
</head>
<body>
    <table>
        <thead>
            <tr>
                <th>Experience</th>
                <th>Skill</th>
                <th>Locations</th>
                <th>Visa</th>
                <th>Resume</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>${experience}</td>
                <td>${skill}</td>
                <td>${location}</td>
                <td>${visa}</td>
                <td><a href="${resumeLink}" target="_blank">View/download Resume</a></td>
            </tr>
        </tbody>
    </table>
</body>
</html>
`;

module.exports = htmlTemplate;
