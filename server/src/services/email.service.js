import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,      // e.g. smtp.gmail.com
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendVerificationEmail = async (email, token) => {
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    await transporter.sendMail({
        from: `'Your App' <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify your email',
        html: `
      <h2>Welcome!</h2>
      <p>Click below to verify your email:</p>
      <a href='${verifyUrl}'>Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `,
    });
};