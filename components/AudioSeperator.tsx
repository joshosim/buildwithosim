'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/* -------------------------------------------------------------------------- */
/* Config + API types (mirror the Python engine's contract)                   */
/* -------------------------------------------------------------------------- */

// Set NEXT_PUBLIC_STEM_API_URL in .env.local, e.g. http://localhost:8000
const API_BASE = (process.env.NEXT_PUBLIC_STEM_API_URL ?? '').replace(/\/+$/, '')

interface ModelInfo {
    id: string
    label: string
    description: string
    stems: string[]
    returns_instrument_stems: boolean
    experimental: boolean
    relative_speed: string
}

interface Limits {
    max_upload_mb: number
    max_duration_seconds: number
    allowed_extensions: string[]
    output_formats: string[]
    job_ttl_seconds: number
}

interface ModelsResponse {
    models: ModelInfo[]
    default_model: string
    limits: Limits
}

interface Stem {
    name: string
    label: string
    kind: 'vocals' | 'accompaniment' | 'instrument'
    format: string
    size_bytes: number
    url: string
    download_url: string
}

interface Job {
    job_id: string
    status: 'queued' | 'processing' | 'completed' | 'failed'
    stage: string
    progress: number | null
    error: { code: string; message: string } | null
    stems: Stem[] | null
    archive: { download_url: string; size_bytes: number } | null
    expires_at: string | null
}

class ApiError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ApiError'
    }
}

const STAGE_LABELS: Record<string, string> = {
    queued: 'Waiting for the engine',
    loading_model: 'Loading the model',
    decoding: 'Reading your audio',
    separating: 'Separating stems',
    encoding: 'Saving stems',
    done: 'Done',
}

const POLL_MS = 1500

function formatBytes(bytes: number) {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatClock(seconds: number) {
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

function absolute(path: string) {
    return /^https?:\/\//.test(path) ? path : `${API_BASE}${path}`
}

async function readError(response: Response): Promise<string> {
    try {
        const body = await response.json()
        if (typeof body?.error?.message === 'string') return body.error.message
    } catch {
        /* not JSON */
    }
    return `The engine answered with an unexpected error (${response.status}).`
}

/** Upload with XMLHttpRequest because fetch() cannot report upload progress. */
function uploadFile(
    form: FormData,
    onProgress: (fraction: number) => void,
    signal: AbortSignal,
): Promise<Job> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', `${API_BASE}/jobs`)
        xhr.responseType = 'json'
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) onProgress(e.loaded / e.total)
        }
        xhr.onload = () => {
            if (xhr.status === 202 && xhr.response) return resolve(xhr.response as Job)
            const message = xhr.response?.error?.message
            reject(new ApiError(message ?? `The upload was rejected (${xhr.status}).`))
        }
        xhr.onerror = () =>
            reject(new ApiError("Couldn't reach the separation engine. Check that it is running and the URL is correct."))
        xhr.onabort = () => reject(new DOMException('Aborted', 'AbortError'))
        signal.addEventListener('abort', () => xhr.abort(), { once: true })
        xhr.send(form)
    })
}

/* -------------------------------------------------------------------------- */
/* One stem: player, volume, mute, download                                   */
/* -------------------------------------------------------------------------- */

function StemPlayer({ stem }: { stem: Stem }) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [volume, setVolume] = useState(1)
    const [muted, setMuted] = useState(false)

    useEffect(() => {
        const el = audioRef.current
        if (!el) return
        el.volume = volume
        el.muted = muted
    }, [volume, muted])

    const accent =
        stem.kind === 'vocals' ? 'border-fuchsia-500/40' : stem.kind === 'accompaniment' ? 'border-indigo-500/40' : 'border-zinc-700'

    return (
        <li className={`rounded-lg border ${accent} bg-zinc-800/60 p-4`}>
            <div className="mb-2 flex items-baseline justify-between gap-2">
                <h4 className="text-sm font-semibold text-zinc-100">{stem.label}</h4>
                <span className="text-xs text-zinc-400">
                    {stem.format.toUpperCase()} · {formatBytes(stem.size_bytes)}
                </span>
            </div>

            <audio
                ref={audioRef}
                controls
                preload="none"
                src={absolute(stem.url)}
                aria-label={`${stem.label} player`}
                className="w-full"
            />

            <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={() => setMuted((m) => !m)}
                    aria-pressed={muted}
                    aria-label={`${muted ? 'Unmute' : 'Mute'} ${stem.label}`}
                    className="rounded-md border border-zinc-600 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-700 aria-pressed:border-amber-500 aria-pressed:text-amber-300"
                >
                    {muted ? 'Muted' : 'Mute'}
                </button>

                <label className="flex min-w-[140px] flex-1 items-center gap-2 text-xs text-zinc-400">
                    <span className="sr-only">{stem.label} volume</span>
                    <span aria-hidden>Vol</span>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        aria-valuetext={`${Math.round(volume * 100)} percent`}
                        className="h-1.5 w-full cursor-pointer accent-indigo-500"
                    />
                </label>

                <a
                    href={absolute(stem.download_url)}
                    download
                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                    Download
                </a>
            </div>
        </li>
    )
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

type Phase = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

export default function AudioSeparator() {
    const [catalog, setCatalog] = useState<ModelsResponse | null>(null)
    const [fetchError, setCatalogError] = useState<string | null>(null)
    const catalogError = API_BASE
        ? fetchError
        : 'NEXT_PUBLIC_STEM_API_URL is not set. Add it to .env.local and restart the dev server.'

    const [file, setFile] = useState<File | null>(null)
    const [fileError, setFileError] = useState<string | null>(null)
    const [duration, setDuration] = useState<number | null>(null)
    const [dragging, setDragging] = useState(false)

    const [modelId, setModelId] = useState('')
    const [format, setFormat] = useState('wav')

    const [phase, setPhase] = useState<Phase>('idle')
    const [uploadFraction, setUploadFraction] = useState(0)
    const [job, setJob] = useState<Job | null>(null)
    const [error, setError] = useState<string | null>(null)

    const abortRef = useRef<AbortController | null>(null)
    const jobIdRef = useRef<string | null>(null)

    /* Load models + limits once. */
    useEffect(() => {
        if (!API_BASE) return
        const controller = new AbortController()
        fetch(`${API_BASE}/models`, { signal: controller.signal })
            .then(async (res) => {
                if (!res.ok) throw new ApiError(await readError(res))
                return (await res.json()) as ModelsResponse
            })
            .then((data) => {
                setCatalog(data)
                setModelId(data.default_model)
                setFormat(data.limits.output_formats[0] ?? 'wav')
            })
            .catch((err) => {
                if (err?.name === 'AbortError') return
                setCatalogError("Couldn't reach the separation engine. Start it and check NEXT_PUBLIC_STEM_API_URL.")
            })
        return () => controller.abort()
    }, [])

    /* Stop polling and free the server's copy of the files when leaving. */
    useEffect(() => {
        return () => {
            abortRef.current?.abort()
            const id = jobIdRef.current
            if (id && API_BASE) fetch(`${API_BASE}/jobs/${id}`, { method: 'DELETE', keepalive: true }).catch(() => { })
        }
    }, [])

    const model = catalog?.models.find((m) => m.id === modelId) ?? null

    const chooseFile = useCallback(
        (next: File | null) => {
            setFileError(null)
            setDuration(null)
            if (!next) return setFile(null)
            if (catalog) {
                const ext = `.${next.name.split('.').pop()?.toLowerCase() ?? ''}`
                if (!catalog.limits.allowed_extensions.includes(ext)) {
                    setFile(null)
                    return setFileError(
                        `Unsupported file type. Use one of: ${catalog.limits.allowed_extensions
                            .map((e) => e.slice(1).toUpperCase())
                            .join(', ')}.`,
                    )
                }
                if (next.size > catalog.limits.max_upload_mb * 1024 * 1024) {
                    setFile(null)
                    return setFileError(`That file is ${formatBytes(next.size)}. The limit is ${catalog.limits.max_upload_mb} MB.`)
                }
            }
            setFile(next)

            // Read the duration locally for display only; the engine enforces the real limit.
            const probe = new Audio()
            const url = URL.createObjectURL(next)
            probe.preload = 'metadata'
            probe.onloadedmetadata = () => {
                if (Number.isFinite(probe.duration)) setDuration(probe.duration)
                URL.revokeObjectURL(url)
            }
            probe.onerror = () => URL.revokeObjectURL(url)
            probe.src = url
        },
        [catalog],
    )

    const discardRemoteJob = () => {
        const id = jobIdRef.current
        jobIdRef.current = null
        if (id) fetch(`${API_BASE}/jobs/${id}`, { method: 'DELETE' }).catch(() => { })
    }

    const reset = () => {
        abortRef.current?.abort()
        discardRemoteJob()
        setPhase('idle')
        setJob(null)
        setError(null)
        setUploadFraction(0)
    }

    const poll = async (jobId: string, signal: AbortSignal) => {
        while (!signal.aborted) {
            const res = await fetch(`${API_BASE}/jobs/${jobId}`, { signal, cache: 'no-store' })
            if (!res.ok) throw new ApiError(await readError(res))
            const current = (await res.json()) as Job
            setJob(current)
            if (current.status === 'completed') return setPhase('done')
            if (current.status === 'failed') {
                setError(current.error?.message ?? 'Separation failed.')
                return setPhase('error')
            }
            await new Promise((r) => setTimeout(r, POLL_MS))
        }
    }

    const handleSeparate = async () => {
        if (!file || !catalog || !model) return
        abortRef.current?.abort()
        discardRemoteJob()
        const controller = new AbortController()
        abortRef.current = controller

        setError(null)
        setJob(null)
        setUploadFraction(0)
        setPhase('uploading')

        const form = new FormData()
        form.append('file', file)
        form.append('model', model.id)
        form.append('format', format)

        try {
            const created = await uploadFile(form, setUploadFraction, controller.signal)
            jobIdRef.current = created.job_id
            setJob(created)
            setPhase('processing')
            await poll(created.job_id, controller.signal)
        } catch (err) {
            if ((err as Error)?.name === 'AbortError') return
            setError(
                err instanceof ApiError
                    ? err.message
                    : "Lost contact with the separation engine. If the track was long, the job may still be running there.",
            )
            setPhase('error')
        }
    }

    const busy = phase === 'uploading' || phase === 'processing'
    const stems = job?.stems ?? []
    const progress = job?.progress ?? null

    /* ---------------------------------------------------------------------- */

    return (
        <section
            aria-labelledby="separator-title"
            className="relative mx-auto my-4 w-full max-w-6xl text-white sm:my-8"
        >
            {/* keyframes live here so the component is a single paste-in file */}
            <style>{`
                @keyframes stem-slide { from { transform: translateX(-100%) } to { transform: translateX(350%) } }
                @media (prefers-reduced-motion: reduce) { .stem-slide { animation: none !important } }
            `}</style>

            <div className="mb-9 sm:mb-12">
                <div className="relative z-10">
                    <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                        Osim Audio Lab <span className="px-1 text-zinc-600">/</span> Stem Studio
                    </p>
                    <h2 id="separator-title" className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-6xl">
                        Separate the parts.
                        <br className="hidden sm:block" /> Keep the music.
                    </h2>
                    <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">
                        Extract vocals and instruments from a track, then preview and download each stem.
                    </p>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-[#111113] p-5 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.9)] sm:p-8 lg:p-10">
                <div className="relative z-10">
                    <div className="mb-6 flex items-center justify-between gap-4 border-b border-white/[0.09] pb-5">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">New session</p>
                            <p className="mt-1 text-sm text-zinc-300">Start with an audio file</p>
                        </div>
                        <span className="font-mono text-[10px] tracking-wider text-zinc-500">AUDIO STEMS</span>
                    </div>

                {catalogError && (
                    <p role="alert" className="mt-5 rounded-xl border border-rose-300/20 bg-rose-500/[0.09] p-4 text-sm leading-6 text-rose-100 shadow-inner shadow-rose-950/20">
                        {catalogError}
                    </p>
                )}

                {/* Drop zone ------------------------------------------------- */}
                {!catalogError && phase !== 'done' && (
                    <>
                        <label
                            onDragOver={(e) => {
                                e.preventDefault()
                                if (!busy) setDragging(true)
                            }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault()
                                setDragging(false)
                                if (!busy) chooseFile(e.dataTransfer.files?.[0] ?? null)
                            }}
                            className={`mt-6 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border px-4 py-10 text-center transition-colors duration-200 focus-within:ring-2 focus-within:ring-violet-400/70 ${dragging ? 'border-violet-400/70 bg-violet-400/[0.06]' : 'border-dashed border-white/[0.16] bg-black/20 hover:border-white/30 hover:bg-white/[0.02]'
                                } ${busy ? 'pointer-events-none opacity-60' : ''}`}
                        >
                            <input
                                type="file"
                                accept={catalog?.limits.allowed_extensions.join(',') ?? 'audio/*'}
                                disabled={busy || !catalog}
                                onChange={(e) => chooseFile(e.target.files?.[0] ?? null)}
                                className="sr-only"
                            />
                            <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-2xl text-zinc-200">
                                {file ? '♫' : '↑'}
                            </span>
                            <span className="text-sm font-semibold text-zinc-100">
                                {file ? 'Choose a different file' : 'Drop your track here'}
                            </span>
                            {!file && <span className="text-xs text-zinc-400">or <span className="text-zinc-200 underline underline-offset-4">browse files</span> to get started</span>}
                            {catalog && (
                                <span className="mt-2 text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                                    {catalog.limits.allowed_extensions.map((e) => e.slice(1).toUpperCase()).join(' · ')} · up to{' '}
                                    {catalog.limits.max_upload_mb} MB · up to {formatClock(catalog.limits.max_duration_seconds)} long
                                </span>
                            )}
                        </label>

                        {fileError && (
                            <p role="alert" className="mt-3 text-sm text-red-300">
                                {fileError}
                            </p>
                        )}

                        {file && (
                            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
                                <dt className="text-slate-400">File</dt>
                                <dd className="truncate text-slate-100" title={file.name}>
                                    {file.name}
                                </dd>
                                <dt className="text-slate-400">Size</dt>
                                <dd className="text-slate-100">{formatBytes(file.size)}</dd>
                                {duration !== null && (
                                    <>
                                        <dt className="text-slate-400">Length</dt>
                                        <dd className="text-slate-100">{formatClock(duration)}</dd>
                                    </>
                                )}
                            </dl>
                        )}

                        {/* Controls ---------------------------------------- */}
                        {catalog && (
                            <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto]">
                                <label className="block text-sm">
                                    <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Model</span>
                                    <select
                                        value={modelId}
                                        onChange={(e) => setModelId(e.target.value)}
                                        disabled={busy}
                                        className="w-full rounded-xl border border-white/10 bg-[#11121b] px-4 py-3 text-sm text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] focus:outline-none focus:ring-2 focus:ring-violet-400/70"
                                    >
                                        {catalog.models.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.label}
                                                {m.relative_speed === 'slower' ? ' (slower)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="block text-sm">
                                    <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Format</span>
                                    <select
                                        value={format}
                                        onChange={(e) => setFormat(e.target.value)}
                                        disabled={busy}
                                        className="w-full rounded-xl border border-white/10 bg-[#11121b] px-4 py-3 text-sm text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] focus:outline-none focus:ring-2 focus:ring-violet-400/70 sm:w-32"
                                    >
                                        {catalog.limits.output_formats.map((f) => (
                                            <option key={f} value={f}>
                                                {f.toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        )}

                        {model && (
                            <p className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 text-xs leading-relaxed text-slate-400">
                                {model.description}{' '}
                                <span className="text-slate-200">Output: {model.stems.join(', ')}.</span>
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={handleSeparate}
                            disabled={!file || !catalog || busy}
                            className="mt-5 w-full rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-white/[0.07] disabled:text-zinc-500"
                        >
                            {busy ? 'Working…' : 'Separate'}
                        </button>
                    </>
                )}

                {/* Status ---------------------------------------------------- */}
                {busy && (
                    <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5" role="status" aria-live="polite">
                        {phase === 'uploading' ? (
                            <ProgressBar label="Uploading" fraction={uploadFraction} />
                        ) : (
                            <ProgressBar
                                label={STAGE_LABELS[job?.stage ?? 'queued'] ?? 'Working'}
                                fraction={progress}
                                note={
                                    progress === null
                                        ? 'This step has no measurable progress. Long tracks can take several minutes.'
                                        : 'Estimate based on the model’s processed segments; it can pause between segments.'
                                }
                            />
                        )}
                        <button
                            type="button"
                            onClick={reset}
                            className="mt-3 text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-200"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {/* Error ----------------------------------------------------- */}
                {phase === 'error' && error && (
                    <div role="alert" className="mt-5 rounded-lg border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-100">
                        <p className="font-medium">Couldn’t separate that track</p>
                        <p className="mt-1 text-red-200">{error}</p>
                        <button type="button" onClick={reset} className="mt-3 rounded-md border border-red-400/50 px-3 py-1.5 text-xs hover:bg-red-900/40">
                            Try again
                        </button>
                    </div>
                )}

                {/* Results --------------------------------------------------- */}
                {phase === 'done' && stems.length > 0 && (
                    <div className="mt-6">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-lg font-semibold">Results</h3>
                            <div className="flex gap-2">
                                {job?.archive && (
                                    <a
                                        href={absolute(job.archive.download_url)}
                                        download
                                        className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold hover:bg-indigo-500"
                                    >
                                        Download all (.zip, {formatBytes(job.archive.size_bytes)})
                                    </a>
                                )}
                                <button
                                    type="button"
                                    onClick={reset}
                                    className="rounded-md border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800"
                                >
                                    New track
                                </button>
                            </div>
                        </div>

                        <ul className="mt-4 grid gap-3">
                            {stems.map((stem) => (
                                <StemPlayer key={stem.name} stem={stem} />
                            ))}
                        </ul>

                        {job?.expires_at && (
                            <p className="mt-3 text-xs text-zinc-500">
                                Files are deleted from the engine at {new Date(job.expires_at).toLocaleTimeString()}. Download what you need before then.
                            </p>
                        )}
                    </div>
                )}

                {/* Honest model note ---------------------------------------- */}
                <p className="mt-8 border-t border-white/[0.09] pt-5 text-xs leading-relaxed text-slate-400/75">
                    Quality and available stems depend on the model. The standard models split a mix into vocals, drums, bass and
                    “other”; “other” is a catch-all (guitars, keys, synths…), not a single instrument. Accompaniment is every
                    non-vocal stem mixed back together. Expect some bleed between stems.
                </p>
                </div>
            </div>
        </section>
    )
}

/* -------------------------------------------------------------------------- */

function ProgressBar({ label, fraction, note }: { label: string; fraction: number | null; note?: string }) {
    const determinate = fraction !== null
    const percent = determinate ? Math.round(fraction * 100) : undefined
    return (
        <div>
            <div className="mb-1 flex justify-between text-xs text-zinc-300">
                <span>{label}</span>
                {determinate && <span>{percent}%</span>}
            </div>
            <div
                role="progressbar"
                aria-label={label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                className="relative h-2 overflow-hidden rounded-full bg-zinc-800"
            >
                {determinate ? (
                    <div className="h-full rounded-full bg-indigo-500 transition-[width] duration-500" style={{ width: `${percent}%` }} />
                ) : (
                    <div
                        className="stem-slide absolute inset-y-0 left-0 w-1/3 rounded-full bg-indigo-500/80"
                        style={{ animation: 'stem-slide 1.4s ease-in-out infinite' }}
                    />
                )}
            </div>
            {note && <p className="mt-1 text-xs text-zinc-500">{note}</p>}
        </div>
    )
}