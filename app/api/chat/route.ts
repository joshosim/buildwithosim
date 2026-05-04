// AI Agent API route handler
import { openai } from "@/lib/openai";
import { sendEmail, sendWhatsApp } from "@/lib/tools";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: `
          You are an AI assistant for Osim, a software engineer.

          Your role is to act as a SALES ASSISTANT, not a project manager.

          Your goals:
          - Understand the user's idea at a high level
          - Ask 1–2 simple follow-up questions if needed
          - Keep the conversation light and natural
          - Focus on the outcome the user wants, not technical details

          IMPORTANT:
          - Do NOT ask for assets like logos, colors, or full content
          - Do NOT go into detailed planning or requirements
          - Do NOT overwhelm the user with too many questions

          Instead:
          - Help the user clarify their idea
          - Show that Osim can handle the details
          - Guide the conversation toward taking action

          When the user shows interest and is ready to proceed:
          - Ask for their name and email
          - use "send_email"

         Tone:
          - Friendly
          - Confident
          - Simple
          - Helpful
        `,
      },
      ...messages,
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "send_email",
          description: "Send a lead to Osim",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string" },
              email: { type: "string" },
              message: { type: "string" },
            },
            required: ["name", "email", "message"],
          },
        }
      },
      // {
      //   type: "function",
      //   function: {
      //     name: "send_whatsapp",
      //     description: "Generate WhatsApp link for contacting Osim",
      //     parameters: {
      //       type: "object",
      //       properties: {
      //         name: { type: "string" },
      //         email: { type: "string" },
      //         project: { type: "string" },
      //       },
      //       required: ["name", "email", "project"],
      //     },
      //   },
      // }
    ]
  });

  const message = response.choices[0].message;

  if (message?.tool_calls) {
    const toolCall = message.tool_calls[0];

    if (toolCall.type === "function"
      && toolCall.function.name === "send_email") {
      const args = JSON.parse(toolCall.function.arguments);

      await sendEmail(args);

      return Response.json({
        message: {
          role: "assistant",
          content:
            "Nice! I've received your details. Osim will reach out shortly 🚀",
        }
      });
    }

    if (toolCall.type === "function" && toolCall.function.name === "send_whatsapp") {
      const args = JSON.parse(toolCall.function.arguments);
      const result = sendWhatsApp(args);

      return Response.json({
        message: {
          role: "assistant",
          content: `Perfect 👌 I've got everything I need.

          You can reach Osim instantly here:
          ${(await result).url}`,
        },
      });
    }
  }

  return Response.json(response);
}
