import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchJobStatus } from '@/lib/stem-polling'

afterEach(() => {
    vi.useRealTimers()
})

describe('fetchJobStatus', () => {
    it('retries a temporary network failure and returns the next response', async () => {
        vi.useFakeTimers()
        const request = vi.fn<typeof fetch>()
            .mockRejectedValueOnce(new TypeError('Network unavailable'))
            .mockResolvedValueOnce(new Response(null, { status: 200 }))
        const onRetry = vi.fn()
        const controller = new AbortController()

        const result = fetchJobStatus('/jobs/id', controller.signal, onRetry, request)
        await vi.advanceTimersByTimeAsync(1_500)

        expect((await result).status).toBe(200)
        expect(request).toHaveBeenCalledTimes(2)
        expect(onRetry).toHaveBeenCalledWith(1)
    })

    it('does not retry a non-transient client response', async () => {
        const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 404 }))

        const result = await fetchJobStatus('/jobs/id', new AbortController().signal, vi.fn(), request)

        expect(result.status).toBe(404)
        expect(request).toHaveBeenCalledTimes(1)
    })

    it('aborts during the retry delay', async () => {
        vi.useFakeTimers()
        const request = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Network unavailable'))
        const controller = new AbortController()
        const result = fetchJobStatus('/jobs/id', controller.signal, vi.fn(), request)
        const rejected = expect(result).rejects.toMatchObject({ name: 'AbortError' })

        await vi.advanceTimersByTimeAsync(0)
        controller.abort()

        await rejected
        expect(request).toHaveBeenCalledTimes(1)
    })
})
