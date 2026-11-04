import type { Metadata } from 'next'
import AudioSeparator from '@/components/AudioSeperator'

export const metadata: Metadata = {
    title: 'Music Stem Separator',
    description: 'Split a song into vocals, accompaniment and instrument stems.',
}

export default function MusicPage() {
    return (
        <div className="relative min-h-screen bg-zinc-950 px-4 py-6 sm:px-6">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(99,102,241,0.25),transparent)]"
            />
            <main className="relative">
                <AudioSeparator />
            </main>
        </div>
    )
}