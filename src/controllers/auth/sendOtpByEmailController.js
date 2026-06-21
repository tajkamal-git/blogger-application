const nodemailer = require('nodemailer');

const sendOtpByEmailController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'gagguturutajkamal07@gmail.com',
        pass: 'nvceakfdvaxdmmlp',
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: 'gagguturutajkamal07@gmail.com',
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP for verification is: ${otp}`,
    };

    console.log('Before sending mail');

    const info = await transporter.sendMail(mailOptions);

    console.log('After sending mail');

    console.log(`OTP sent to ${email} via email: ${otp}`);
    console.log('Message sent: %s', info.messageId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending OTP via email:', error.stack);
    res.status(500).json({ success: false, error: 'Failed to send OTP via email', errorMessage: error.message });
  }
};

module.exports = sendOtpByEmailController;
