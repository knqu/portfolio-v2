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
            SUBMISSION\n
            Full Name: ${name}\n
            Email: ${email}\n
            Message: ${body}\n\n

            DETAILS:\n
            Date: ${new Date()}\n
            IP Address: ${ip}
        `,
        html: `
            <h2 style="margin-bottom:4px">Submission</h2>
            <b>Full Name:</b> ${name}<br>
            <b>Email:</b> ${email}<br>
            <b>Message:</b> ${body}<br>
                
            <h2 style="margin-bottom:4px">Details</h2>
            <b>Date:</b> ${new Date()}<br>
            <b>IP Address:</b> ${ip}
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
            DETAILS:\n
            Date: ${new Date()}\n
            User IP: ${ip}\n
            Error: ${err}\n
        `,
        html: `
            <h2 style="margin-bottom:4px">Details</h2>
            <b>Date:</b> ${new Date()}<br>
            <b>User IP:</b> ${ip}<br>
            <b>Error:</b> ${err}
        `
    };

    transporter.sendMail(message);
};
