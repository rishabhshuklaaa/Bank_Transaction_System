const nodemailer = require('nodemailer');

/**
 * Transporter Configuration using App Password
 * This is more reliable for deployed applications than OAuth2
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // 16-digit App Password from Google
    },
});

// Verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Error connecting to email server:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

// Internal helper function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"SkyBank Support" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });

        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// 1. Send Welcome Email after Registration
async function sendRegistrationEmail(userEmail, name) {
    const subject = 'Welcome to SkyBank!';
    const text = `Hello ${name},\n\nThank you for registering at SkyBank. We're excited to have you on board!\n\nBest regards,\nThe SkyBank Team`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">Welcome to SkyBank, ${name}!</h2>
            <p>Thank you for joining our next-gen digital banking platform. Your account is now active.</p>
            <p>You can now manage your assets and perform secure transactions globally.</p>
            <br />
            <p>Best regards,<br><strong>SkyBank Team</strong></p>
        </div>
    `;

    await sendEmail(userEmail, subject, text, html);
}

// 2. Send Success Email after Transaction
async function sendTransactionEmail(userEmail, name, amount, toAccount) {
    const subject = 'Transaction Successful!';
    const text = `Hello ${name},\n\nYour transaction of ₹${amount} to account ${toAccount} was successful.`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #059669;">Transaction Successful!</h2>
            <p>Hello ${name},</p>
            <p>Your transfer of <strong>₹${amount}</strong> to account <strong>${toAccount}</strong> has been processed successfully.</p>
            <br />
            <p>Best regards,<br><strong>SkyBank Team</strong></p>
        </div>
    `;

    await sendEmail(userEmail, subject, text, html);
}

// 3. Send Failure Email if Transaction fails
async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
    const subject = 'Transaction Failed';
    const text = `Hello ${name},\n\nWe regret to inform you that your transaction of ₹${amount} to account ${toAccount} has failed.`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #dc2626;">Transaction Failed</h2>
            <p>Hello ${name},</p>
            <p>We regret to inform you that your transaction of <strong>₹${amount}</strong> to account <strong>${toAccount}</strong> has failed. Please check your balance or try again later.</p>
            <br />
            <p>Best regards,<br><strong>SkyBank Team</strong></p>
        </div>
    `;

    await sendEmail(userEmail, subject, text, html);
}

module.exports = {
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionFailureEmail
};