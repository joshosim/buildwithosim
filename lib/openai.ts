import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "https://buildwithosim.com",
    "X-Title": "BuildWithOsim",
  },
});
