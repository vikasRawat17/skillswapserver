import nodemailer from "nodemailer";

export const sendEmail = async (data) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"SkillSwap Team" <${process.env.EMAIL_USER}>`,
      to: data.email,
      subject: "👋 Welcome to SkillSwap - Let’s Learn and Grow!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #4CAF50;">Welcome, ${data.name}!</h1>
          <p style="font-size: 16px;">Thanks for joining <b>SkillSwap</b> — the platform to learn, share, and grow your skills with a vibrant community.</p>
          <p style="font-size: 14px;">Start exploring new opportunities and expand your network today.</p>
          <br/>
          <p style="font-size: 12px; color: #777;">Happy learning,<br/>The SkillSwap Team</p>
        </div>
      `,
      attachments: [
        {
          filename: "skillswap-logo.png",
          path: "src/uploads/profiles/default-image.jpg",
          cid: "skillswaplogo",
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
};
