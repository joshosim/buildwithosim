import type { Metadata } from 'next'
import AudioSeparator from '@/components/AudioSeperator'

export const metadata: Metadata = {
    title: 'Music Stem Separator',
    description: 'Split a song into vocals, accompaniment and instrument stems.',
}

export default function MusicPage() {
    return (
        <div className="relative min-h-screen bg-[#0b0b0c] px-4 py-8 text-white sm:px-6 lg:py-12">
            <main className="relative">
                <AudioSeparator />
            </main>
        </div>
    )
}