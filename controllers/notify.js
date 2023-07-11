require('dotenv').config();
const nodemailer = require('nodemailer');

const adminEmail = process.env.NODEMAILER_EMAIL_ADDRESS;

module.exports.message = async function (name, email, body, ip) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: adminEmail,
            pass: process.env.NODEMAILER_EMAIL_PASS,
            clientId: process.env.NODEMAILER_CLIENT_ID,
            clientSecret: process.env.NODEMAILER_CLIENT_SECRET,
            refreshToken: process.env.NODEMAILER_REFRESH_TOKEN
        }
    });

    let message = {
        from: `"${name}" <${email}>`,
        to: `${adminEmail}`,
        subject: `Message from ${name}`,
        text: `
            Full Name: ${name}\n
            Timestamp: ${new Date()}\n
            Email Address: ${email}\n
            IP Address: ${ip}\n
            Message: ${body}\n
        `,
        html: `
            <p style="font-family:Tahoma">Full Name: ${name}</p>
            <p style="font-family:Tahoma">Timestamp: ${new Date()}</p>
            <p style="font-family:Tahoma">Email Address: ${email}</p>
            <p style="font-family:Tahoma">IP Address: ${ip}</p>
            <p style="font-family:Tahoma">Message: ${body}</p>
        `
    };

    transporter.sendMail(message);
};

module.exports.alert = async function (err, ip) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: adminEmail,
            pass: process.env.NODEMAILER_EMAIL_PASS,
            clientId: process.env.NODEMAILER_CLIENT_ID,
            clientSecret: process.env.NODEMAILER_CLIENT_SECRET,
            refreshToken: process.env.NODEMAILER_REFRESH_TOKEN
        }
    });

    let message = {
        from: `"Alert" <${adminEmail}>`,
        to: `${adminEmail}`,
        subject: `Application Error`,
        text: `
            Timestamp: ${new Date()}\n
            IP Address: ${ip}\n
            Error Details: ${err}\n
        `,
        html: `
            <p style="font-family:Tahoma">Timestamp: ${new Date()}</p>
            <p style="font-family:Tahoma">IP Address: ${ip}</p>
            <p style="font-family:Tahoma">Error Details: ${err}</p>
        `
    };

    transporter.sendMail(message);
};
