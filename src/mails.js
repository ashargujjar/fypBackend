import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
export const SendMail = async ({ to, subject, text, html }) => {
  try {
    await transporter.sendMail({
      from: `"ShipSmart" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
};
