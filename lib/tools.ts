// My Agent Tools

import { MailtrapTransport } from "mailtrap";
import nodemailer from "nodemailer";

const transport = nodemailer.createTransport(
  MailtrapTransport({
    token: process.env.MAILTRAP_TOKEN!,
  })
);
interface MessageProps {
  name: string;
  email: string;
  message: string;
}
export async function sendEmail({ email, message, name }: MessageProps) {
  //for test purposes
  console.log("Sending email with the following details:");
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Message:", message);

  try {
    const info = await transport.sendMail({
      from: {
        address: process.env.EMAIL_FROM!,
        name: "Osim AI Assistant",
      },
      to: [process.env.EMAIL_TO!], // 👈 YOU receive it
      subject: "🚀 New Lead from Portfolio AI",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>New Lead 🚀</h2>

          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>

          <p><strong>Project:</strong></p>
          <p>${message}</p>

          <hr />
          <p style="font-size: 12px; color: gray;">
            Sent from your AI portfolio assistant
          </p>
        </div>
      `,
    });

    console.log("✅ Email sent:", info);

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Email failed:", error);

    return {
      success: false,
      message: "Failed to send email"
    };
  }

}

export async function sendWhatsApp({ email, message, name }: MessageProps) {
  const text = encodeURIComponent(
    `New Lead 🚀

      Name: ${name}
      Email: ${email}

      Message:
      ${message}`
  );

  const url = `https://wa.me/2347066530998?text=${text}`;

  return { url };
}