// My Agent Tools

import { MailtrapTransport } from "mailtrap";
import nodemailer from "nodemailer";

export interface SendResult {
  success: boolean;
  message?: string;
}

interface MessageProps {
  name: string;
  email: string;
  message: string;
}

let transport: ReturnType<typeof nodemailer.createTransport> | null = null;

/**
 * Built on first use rather than at import time: `MailtrapTransport` throws
 * when the token is missing, which would otherwise take down every module that
 * imports this file — including the chat route.
 */
function getTransport() {
  if (!transport) {
    transport = nodemailer.createTransport(
      MailtrapTransport({
        token: process.env.MAILTRAP_TOKEN!,
      })
    );
  }
  return transport;
}

/** Visitor input is interpolated into the email HTML, so escape it. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendEmail({ email, message, name }: MessageProps): Promise<SendResult> {
  if (!process.env.MAILTRAP_TOKEN || !process.env.EMAIL_FROM || !process.env.EMAIL_TO) {
    const missing = "Email is not configured. Set MAILTRAP_TOKEN, EMAIL_FROM and EMAIL_TO.";
    console.error(`❌ ${missing}`);
    return { success: false, message: missing };
  }

  try {
    const info = await getTransport().sendMail({
      from: {
        address: process.env.EMAIL_FROM!,
        name: "Osim AI Assistant",
      },
      to: [process.env.EMAIL_TO!], // 👈 YOU receive it
      subject: "🚀 New Lead from Portfolio AI",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>New Lead 🚀</h2>

          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>

          <p><strong>Project:</strong></p>
          <p>${escapeHtml(message)}</p>

          <hr />
          <p style="font-size: 12px; color: gray;">
            Sent from your AI portfolio assistant
          </p>
        </div>
      `,
    });

    console.log("✅ Email sent:", info);

    return { success: true };
  } catch (error) {
    console.error("❌ Email failed:", error);

    return {
      success: false,
      message: "Failed to send email",
    };
  }
}

export async function sendWhatsApp({
  email,
  message,
  name,
}: MessageProps): Promise<{ url: string }> {
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
