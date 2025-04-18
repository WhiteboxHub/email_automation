const htmlTemplate = (name, experience, genAI_exp, software_exp, email, linkedin, phone) => `

<p>Hello,</p>
<p>Good morning! I hope you are doing well.</p>
<p>My name is ${name}, and I am an ML Engineer with ${experience}, including ${genAI_exp} of hands-on experience in Generative AI. ${software_exp} I am currently exploring new opportunities and would love to connect if there's a role that aligns with my background.</p>

<h3>In Generative AI, I've recently worked on:</h3>
<ul>
    <li>RAG (Retrieval Augmented Generation) and Agentic AI systems</li>
    <li>LLMs (Large Language Models)</li>
    <li>Fine-tuning</li>
    <li>Classification and Summarization</li>
</ul>

<h3>In traditional ML, I've worked extensively with:</h3>
<ul>
    <li>MLOps</li>
    <li>MLflow</li>
    <li>Databricks</li>
    <li>AWS</li>
</ul>

<p>You can view my LinkedIn profile here: <a href="${linkedin}" target="_blank">${linkedin}</a></p>

<p>If you’d like a copy of my resume or any additional details, feel free to reach out at <strong style="color:darkblue"><a href="mailto:${email}">${email}</a></strong></p>

<p>Looking forward to hearing from you!</p>

<p>Best regards,</p>
<p><strong>${name}</strong></p>
<p style="margin-top: -10px; font-size: 15px;"><strong><a href="tel:${phone}">${phone}</a></strong></p>
<html lang="en">
<head>
    <title>${name} - ML Engineer Profile</title>
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
    
</body>
</html>
`;

module.exports = htmlTemplate;
