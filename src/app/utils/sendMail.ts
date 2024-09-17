import nodemailer from "nodemailer";
import config from "../config";

const sendMail = async (email: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: config.emailSender.email,
      pass: config.emailSender.app_pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const info = await transporter.sendMail({
    from: `"Arkham Healthcare 🏥" <${config.emailSender.email}>`, // sender address
    to: email, // list of receivers
    subject: "Reset Password Link 🔗", // Subject line
    text: "Click on the link to reset your password. Link expires in 10 minutes.", // plain text body
    html, // html body
  });

  // console.log("Message sent: %s", info.messageId);
};

export default sendMail;
