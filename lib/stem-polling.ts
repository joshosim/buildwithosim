const MAX_RETRIES = 6
const INITIAL_RETRY_DELAY_MS = 1_500
const MAX_RETRY_DELAY_MS = 15_000

function wait(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        const onAbort = () => {
            clearTimeout(timer)
            signal.removeEventListener('abort', onAbort)
            reject(new DOMException('Aborted', 'AbortError'))
        }
        const timer = setTimeout(() => {
            signal.removeEventListener('abort', onAbort)
            resolve()
        }, ms)

        if (signal.aborted) onAbort()
        else signal.addEventListener('abort', onAbort, { once: true })
    })
}

function isRetryableStatus(status: number) {
    return status === 408 || status === 425 || status === 429 || status >= 500
}

export async function fetchJobStatus(
    url: string,
    signal: AbortSignal,
    onRetry: (attempt: number) => void,
    request: typeof fetch = fetch,
): Promise<Response> {
    let attempt = 0

    while (true) {
        let response: Response
        try {
            response = await request(url, { signal, cache: 'no-store' })
        } catch (error) {
            if (signal.aborted || attempt >= MAX_RETRIES) throw error
            attempt += 1
            onRetry(attempt)
            await wait(Math.min(INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1), MAX_RETRY_DELAY_MS), signal)
            continue
        }

        if (!isRetryableStatus(response.status) || attempt >= MAX_RETRIES) return response
        attempt += 1
        onRetry(attempt)
        await wait(Math.min(INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1), MAX_RETRY_DELAY_MS), signal)
    }
}
