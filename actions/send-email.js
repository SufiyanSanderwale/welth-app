"use server";

import { Resend } from "resend";

export async function sendEmail({ to, subject, react }) {
  const apiKey = process.env.RESEND_API_KEY || "";
  if (!apiKey) {
    console.error(
      "RESEND_API_KEY is not set. Email will not be delivered. Add it to .env.local"
    );
    return { success: false, error: "Missing RESEND_API_KEY" };
  }

  const resend = new Resend(apiKey);

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM || "Finance App <onboarding@resend.dev>",
      to,
      subject,
      react,
    });

    if (data?.error) {
      return { success: false, error: data.error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
