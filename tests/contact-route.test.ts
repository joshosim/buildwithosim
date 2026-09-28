import { beforeEach, describe, expect, it, vi } from 'vitest'
import { jsonRequest } from './helpers'

const mocks = vi.hoisted(() => ({
  sendEmail: vi.fn(),
  sendWhatsApp: vi.fn(),
}))

vi.mock('@/lib/tools', () => ({
  sendEmail: mocks.sendEmail,
  sendWhatsApp: mocks.sendWhatsApp,
}))

const { POST } = await import('@/app/api/contact/route')

const ENDPOINT = 'http://localhost/api/contact'

const VALID = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'I would like a booking site for my studio.',
}

beforeEach(() => {
  mocks.sendEmail.mockReset().mockResolvedValue({ success: true })
})

describe('POST /api/contact', () => {
  it('sends the enquiry and reports success', async () => {
    const response = await POST(jsonRequest(ENDPOINT, VALID))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(mocks.sendEmail).toHaveBeenCalledWith(VALID)
  })

  it('rejects a body that is not JSON', async () => {
    const response = await POST(jsonRequest(ENDPOINT, 'not json at all'))

    expect(response.status).toBe(400)
    expect(mocks.sendEmail).not.toHaveBeenCalled()
  })

  const invalidCases: Array<[string, Record<string, unknown>, string]> = [
    ['name', { ...VALID, name: '' }, 'Name is required'],
    ['name', { ...VALID, name: '   ' }, 'Name is required'],
    ['email', { ...VALID, email: 'nope' }, 'Email is not valid'],
    ['email', { ...VALID, email: undefined }, 'Email is required'],
    ['message', { ...VALID, message: '' }, 'Message is required'],
  ]

  it.each(invalidCases)('rejects an invalid %s with 422', async (_field, body, message) => {
    const response = await POST(jsonRequest(ENDPOINT, body))

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toEqual({ error: message })
    expect(mocks.sendEmail).not.toHaveBeenCalled()
  })

  it('enforces the length caps server-side, not just in the browser', async () => {
    const response = await POST(jsonRequest(ENDPOINT, { ...VALID, message: 'x'.repeat(5001) }))

    expect(response.status).toBe(422)
    expect(mocks.sendEmail).not.toHaveBeenCalled()
  })

  it('trims whitespace before sending', async () => {
    await POST(jsonRequest(ENDPOINT, { ...VALID, name: '  Ada  ', email: ' ada@example.com ' }))

    expect(mocks.sendEmail).toHaveBeenCalledWith({
      ...VALID,
      name: 'Ada',
      email: 'ada@example.com',
    })
  })

  it('passes only the known fields through, dropping anything else in the body', async () => {
    await POST(jsonRequest(ENDPOINT, { ...VALID, role: 'admin', published: false }))

    expect(mocks.sendEmail).toHaveBeenCalledWith(VALID)
  })

  it('surfaces the sender error when mail fails to send', async () => {
    mocks.sendEmail.mockResolvedValue({ success: false, message: 'Failed to send email' })

    const response = await POST(jsonRequest(ENDPOINT, VALID))

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({ error: 'Failed to send email' })
  })

  it('falls back to a generic error when the sender gives no reason', async () => {
    mocks.sendEmail.mockResolvedValue({ success: false })

    const response = await POST(jsonRequest(ENDPOINT, VALID))

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({ error: 'Could not send your message.' })
  })
})
