const nodemailer = require('nodemailer');

const sendMail = async (to, subject, html, body) => {
  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let mailOptions = {
      from: process.env.EMAIL_ID,
      to,
      subject,
      text: body,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Mail sent successfully to ${to}`);
  } catch (error) {
    console.error('Error while sending mail:', error);
  }
};

module.exports = { sendMail };

