import type { Metadata } from 'next'
import { Space_Grotesk, Instrument_Serif } from 'next/font/google';
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Providers from '@/components/Providers'
import ScrollToTop from '@/components/ScrollToTop'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700']
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument-serif",
});


export const metadata: Metadata = {
  title: 'BuildWithOsim',
  description: 'Software Developer • Creative Designer • Digital Creator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} ${instrumentSerif.variable}`}>
        <Providers>
          <ScrollToTop />
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}