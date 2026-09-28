import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  sendMail: vi.fn(),
  createTransport: vi.fn(),
  MailtrapTransport: vi.fn(),
}))

vi.mock('mailtrap', () => ({ MailtrapTransport: mocks.MailtrapTransport }))
vi.mock('nodemailer', () => ({ default: { createTransport: mocks.createTransport } }))

const { sendEmail, sendWhatsApp } = await import('@/lib/tools')

const ENV = {
  MAILTRAP_TOKEN: 'token',
  EMAIL_FROM: 'assistant@buildwithosim.com',
  EMAIL_TO: 'osim@buildwithosim.com',
}

const ENQUIRY = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'I need a booking site.',
}

function clearEnv() {
  Object.keys(ENV).forEach((key) => delete process.env[key])
}

/** The `html` body handed to nodemailer by the most recent send. */
function sentHtml() {
  return mocks.sendMail.mock.calls[0][0].html as string
}

beforeEach(() => {
  Object.assign(process.env, ENV)
  mocks.sendMail.mockReset().mockResolvedValue({ messageId: '1' })
  mocks.createTransport.mockReset().mockReturnValue({ sendMail: mocks.sendMail })
  mocks.MailtrapTransport.mockReset().mockReturnValue({})
})

afterEach(clearEnv)

describe('sendEmail configuration', () => {
  // Deliberately first: nothing above this has sent mail yet, so this is the
  // assertion that the transport is built on use rather than at import time —
  // which is what keeps a missing MAILTRAP_TOKEN from taking down every module
  // that imports this file, including the chat route.
  it('does not build a transport until it is actually needed', () => {
    expect(mocks.createTransport).not.toHaveBeenCalled()
  })

  it('reports a helpful failure instead of throwing when email is unconfigured', async () => {
    clearEnv()

    const result = await sendEmail(ENQUIRY)

    expect(result.success).toBe(false)
    expect(result.message).toContain('MAILTRAP_TOKEN')
    expect(mocks.sendMail).not.toHaveBeenCalled()
  })

  it.each(Object.keys(ENV))('refuses to send when %s is missing', async (missing) => {
    delete process.env[missing]

    const result = await sendEmail(ENQUIRY)

    expect(result.success).toBe(false)
    expect(mocks.sendMail).not.toHaveBeenCalled()
  })
})

describe('sendEmail delivery', () => {
  it('sends to the configured recipient and reports success', async () => {
    await expect(sendEmail(ENQUIRY)).resolves.toEqual({ success: true })

    const mail = mocks.sendMail.mock.calls[0][0]
    expect(mail.to).toEqual([ENV.EMAIL_TO])
    expect(mail.from.address).toBe(ENV.EMAIL_FROM)
    expect(mail.html).toContain(ENQUIRY.message)
  })

  it('reports failure when the transport rejects, without leaking the error', async () => {
    mocks.sendMail.mockRejectedValue(new Error('SMTP said no'))

    await expect(sendEmail(ENQUIRY)).resolves.toEqual({
      success: false,
      message: 'Failed to send email',
    })
  })
})

describe('sendEmail escaping', () => {
  it('escapes markup so visitor input cannot inject into the email body', async () => {
    await sendEmail({ ...ENQUIRY, message: '<script>alert(1)</script>' })

    const html = sentHtml()
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('escapes the name and email fields too', async () => {
    await sendEmail({
      ...ENQUIRY,
      name: 'Ada "The Countess" <b>Lovelace</b>',
      email: 'ada+<tag>@example.com',
    })

    const html = sentHtml()
    expect(html).not.toContain('<b>')
    expect(html).toContain('&lt;b&gt;')
    expect(html).toContain('&quot;The Countess&quot;')
    expect(html).toContain('&lt;tag&gt;')
  })

  it('escapes ampersands before the other entities, so nothing double-encodes', async () => {
    await sendEmail({ ...ENQUIRY, message: 'Tom & Jerry <3' })

    const html = sentHtml()
    expect(html).toContain('Tom &amp; Jerry')
    expect(html).toContain('&lt;3')
    expect(html).not.toContain('&amp;lt;')
  })
})

describe('sendWhatsApp', () => {
  it('returns a wa.me deep link carrying the enquiry', async () => {
    const { url } = await sendWhatsApp(ENQUIRY)

    expect(url.startsWith('https://wa.me/')).toBe(true)

    const text = decodeURIComponent(url.split('?text=')[1])
    expect(text).toContain(ENQUIRY.name)
    expect(text).toContain(ENQUIRY.email)
    expect(text).toContain(ENQUIRY.message)
  })

  it('percent-encodes the message so the link survives being pasted', async () => {
    const { url } = await sendWhatsApp({ ...ENQUIRY, message: 'Hi & bye\nnew line' })

    expect(url).not.toContain('\n')
    expect(url).toContain('%26')
    expect(url).toContain('%0A')
  })
})
