import { NextResponse } from 'next/server'
import * as yup from 'yup'
import { sendEmail } from '@/lib/tools'

export const maxDuration = 30

/**
 * Re-validated server-side — the client schema is a UX convenience, not a
 * trust boundary.
 */
const schema = yup.object({
  name: yup.string().trim().required('Name is required').max(120),
  email: yup.string().trim().email('Email is not valid').required('Email is required').max(200),
  message: yup.string().trim().required('Message is required').max(5000),
})

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  let payload: { name: string; email: string; message: string }

  try {
    payload = await schema.validate(body, { abortEarly: true, stripUnknown: true })
  } catch (cause) {
    const message = cause instanceof yup.ValidationError ? cause.message : 'Invalid submission.'
    return NextResponse.json({ error: message }, { status: 422 })
  }

  const result = await sendEmail(payload)

  if (!result.success) {
    return NextResponse.json(
      { error: result.message ?? 'Could not send your message.' },
      { status: 502 }
    )
  }

  return NextResponse.json({ ok: true })
}
