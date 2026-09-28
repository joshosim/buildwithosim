import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { sendEmail, sendWhatsApp, type SendResult } from '@/lib/tools'

export const maxDuration = 30

// Derived from the SDK's own signature rather than deep-imported type paths,
// which move between openai versions.
type ChatParams = Parameters<typeof openai.chat.completions.create>[0]
type ChatMessages = ChatParams['messages']
type AssistantMessage = Extract<ChatMessages[number], { role: 'assistant' }>
type ChatTools = NonNullable<ChatParams['tools']>

const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'

/** Caps how many tool round-trips a single request can trigger. */
const MAX_TOOL_ROUNDS = 4
const MAX_MESSAGES = 20
const MAX_CONTENT_CHARS = 4000

const SYSTEM_PROMPT = `You are the assistant on Osim Uka's portfolio site (BuildWithOsim).

Osim is a full-stack software developer who builds websites, mobile apps and digital tools for
businesses and creators. He works in React, Next.js, TypeScript, React Native and Node.js, and
takes on web development, mobile apps, landing pages for creators, and custom digital tools.

Answer questions about Osim's work, experience and services. Be concise, warm and concrete —
two or three short sentences unless asked for detail. Use markdown when it helps readability.

If a visitor wants to get in touch, or shares their name and email along with a project
description, use the sendEmail tool to pass the enquiry on to Osim. If they would rather chat on
WhatsApp, use sendWhatsApp and share the resulting link. Never invent an email address, phone
number or a project that is not described above — if you do not know something, say so and offer
to pass the question to Osim.`

const tools: ChatTools = [
  {
    type: 'function',
    function: {
      name: 'sendEmail',
      description:
        "Send Osim an email with the visitor's enquiry. Use when they want to get in touch or " +
        'provide their contact details.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: "The visitor's name" },
          email: { type: 'string', description: "The visitor's email address" },
          message: { type: 'string', description: 'What they want to build or ask' },
        },
        required: ['name', 'email', 'message'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'sendWhatsApp',
      description:
        'Build a WhatsApp deep link so the visitor can message Osim directly. Use when they ' +
        'express a preference for WhatsApp.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: "The visitor's name" },
          email: { type: 'string', description: "The visitor's email address" },
          message: { type: 'string', description: 'What they want to build or ask' },
        },
        required: ['name', 'email', 'message'],
      },
    },
  },
]

interface IncomingMessage {
  role?: unknown
  content?: unknown
}

/** Keeps only well-formed turns, so a crafted body can't inject a system prompt. */
function sanitize(messages: IncomingMessage[]): ChatMessages {
  return messages
    .filter(
      (message) =>
        message &&
        (message.role === 'user' || message.role === 'assistant') &&
        typeof message.content === 'string'
    )
    .slice(-MAX_MESSAGES)
    // Two branches rather than one object literal: `ChatMessages` is a
    // discriminated union, and a single literal typed `role: 'user' | 'assistant'`
    // is not assignable to it.
    .map((message): ChatMessages[number] => {
      const content = (message.content as string).slice(0, MAX_CONTENT_CHARS)
      return message.role === 'user'
        ? { role: 'user', content }
        : { role: 'assistant', content }
    })
}

/**
 * What a tool hands back. Declared as a union of the concrete shapes rather than
 * `Record<string, unknown>` so each branch keeps its own type — `SendResult` is
 * an interface, and interfaces get no implicit index signature.
 */
type ToolResult = SendResult | { url: string } | { error: string }

async function runTool(
  name: string,
  rawArguments: string
): Promise<ToolResult> {
  let args: Record<string, unknown>

  try {
    args = JSON.parse(rawArguments || '{}')
  } catch {
    return { error: 'Could not parse tool arguments.' }
  }

  const payload = {
    name: String(args.name ?? '').slice(0, 200),
    email: String(args.email ?? '').slice(0, 200),
    message: String(args.message ?? '').slice(0, MAX_CONTENT_CHARS),
  }

  switch (name) {
    case 'sendEmail':
      return sendEmail(payload)
    case 'sendWhatsApp':
      return sendWhatsApp(payload)
    default:
      return { error: `Unknown tool: ${name}` }
  }
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'Chat is not configured yet. Set OPENAI_API_KEY.' },
      { status: 503 }
    )
  }

  let body: { messages?: IncomingMessage[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const history = sanitize(Array.isArray(body?.messages) ? body.messages : [])
  if (history.length === 0) {
    return NextResponse.json({ error: 'No messages provided.' }, { status: 400 })
  }

  const messages: ChatMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
  ]

  try {
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const completion = await openai.chat.completions.create({
        model: MODEL,
        messages,
        tools,
        tool_choice: 'auto',
      })

      const choice = completion.choices[0]?.message
      if (!choice) break

      const toolCalls = choice.tool_calls ?? []

      if (toolCalls.length === 0) {
        return NextResponse.json({
          message: { role: 'assistant', content: choice.content ?? '' },
        })
      }

      messages.push(choice as AssistantMessage)

      for (const call of toolCalls) {
        if (call.type !== 'function') continue
        const result = await runTool(call.function.name, call.function.arguments)
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(result),
        })
      }
    }

    // Ran out of tool rounds — make one final call without tools so the visitor
    // still gets a reply rather than an error.
    const final = await openai.chat.completions.create({ model: MODEL, messages })
    return NextResponse.json({
      message: {
        role: 'assistant',
        content: final.choices[0]?.message?.content ?? '',
      },
    })
  } catch (cause) {
    console.error('[/api/chat]', cause)
    return NextResponse.json({ error: 'The assistant is unavailable right now.' }, { status: 502 })
  }
}
