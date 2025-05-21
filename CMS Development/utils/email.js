const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  let transporter;

  //Create a transporter
  if (process.env.NODE_ENV === 'production') {
    //Production transporter
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    //Development transporter (using Ethereal for testing)
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, //true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }

  //Define email options
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'admin@fennecfc.com',
    to: options.email,
    subject: options.subject,
    html: options.message
  };

  //Send email
  const info = await transporter.sendMail(mailOptions);

  //Log URL for development testing
  if (process.env.NODE_ENV !== 'production') {
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
};

module.exports = sendEmail;