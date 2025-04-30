import nodemailer from "nodemailer";

export const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for skillswap",
      html: `
        <div style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
          <img src="skillswaplogo" alt="GotOo Logo" style="max-width: 150px; margin-bottom: 20px;">
          <h1 style="color: #333;">skillswap OTP Verification</h1>
          <p style="font-size: 16px; color: #555;">
            Your OTP for password reset is:
          </p>
          <h2 style="color: #ff5733; font-size: 24px;">${otp}</h2>
          <p style="font-size: 14px; color: #777;">
            Please use this OTP within the next 5 minutes.
          </p>
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

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};
