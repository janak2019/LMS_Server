import nodemailer from "nodemailer";

export const sendEmail = async ({email, subject, message}) => {
  
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,              // "smtp.gmail.com"
      port: Number(process.env.SMTP_PORT),      // 465 or 587
      secure: Number(process.env.SMTP_PORT) === 465, // true if 465
      auth: {
        user: process.env.SMTP_MAIL,            // sender email
        pass: process.env.SMTP_PASS,            // app password
      },
    });

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,    
      subject,
      html:message,        // must be valid recipient
     
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};
