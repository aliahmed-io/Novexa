import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
    console.warn("⚠️ RESEND_API_KEY is missing in environment variables. Email sending will fail.");
}

export const resend = new Resend(apiKey || "re_missing_key");
