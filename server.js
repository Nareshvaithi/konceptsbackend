const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = 5555;

app.use(cors());
app.use(bodyParser.json());

// Health check route
app.get('/api/check', (req, res) => {
    res.json({ message: "API is working fine!" });
});

// Configure Multer
const upload = multer({ dest: 'uploads/' });

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_PORT === '465', // Use SSL for port 465
    auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

// Error handler middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error occurred:', err.message, err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
};

// Contact form handler
app.post('/api/contact', async (req, res, next) => {
    try {
        const contactData = req.body;

        const mailOptions = {
            from: contactData.email,
            to: process.env.SMTP_MAIL,
            subject: 'New Contact Form Submission',
            text: `
                Name: ${contactData.name}
                Phone Number: ${contactData.PhoneNumber}
                Email: ${contactData.email}
                Country: ${contactData.country}
                Budget: ${contactData.budget}
                Services: ${contactData.services.join(', ')}
                Project Details: ${contactData.projectDetails}
            `,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Contact data received and email sent successfully!' });
    } catch (error) {
        next(error);
    }
});


// Carrier form handler
app.post('/api/carrier', upload.single('resume'), async (req, res, next) => {
    try {
        const carrierData = req.body;
        const resumeFile = req.file;

        if (!carrierData.Email || !carrierData.FirstName) {
            return res.status(400).json({ message: 'Email and First Name are required!' });
        }

        const mailOptions = {
            from: carrierData.Email,
            to: process.env.SMTP_MAIL,
            subject: 'New Carrier Form Submission',
            text: `
                FirstName: ${carrierData.FirstName}
                LastName: ${carrierData.LastName}
                Email: ${carrierData.Email}
                PhoneNumber: ${carrierData.PhoneNumber}
                College Name: ${carrierData.CollegeName}
                Services: ${carrierData.details ? carrierData.details.join(', ') : 'None provided'}
                Department: ${carrierData.Department}
                Portfolio Link: ${carrierData.PortfolioLink}
            `,
            attachments: [
                {
                    filename: resumeFile.originalname,
                    path: resumeFile.path,
                },
            ],
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Carrier data received and email sent successfully!' });
    } catch (error) {
        next(error);
    }
});

// Get A Quote handler
app.post('/api/getaqoute', async (req, res, next) => {
    try {
        const quoteData = req.body;

        const mailOptions = {
            from: quoteData.email,
            to: process.env.SMTP_MAIL,
            subject: 'New Quote Form Submission',
            text: `
                Services: ${quoteData.servicevalue}
                First Name: ${quoteData.firstname}
                Last Name: ${quoteData.lastname}
                PhoneNumber: ${quoteData.phonenumber}
                Email: ${quoteData.email}
                Document: ${quoteData.doclink}
                Budget: ${quoteData.budget}
                Deadline: ${quoteData.deadline}
                Meetup: ${quoteData.meetup}
                Goal: ${quoteData.goal}
                Company: ${quoteData.company}
            `,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Quote data received and email sent successfully!' });
    } catch (error) {
        next(error);
    }
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
