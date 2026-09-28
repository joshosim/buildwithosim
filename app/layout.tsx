import type { Metadata } from 'next'
import { Work_Sans } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import SiteChrome from '@/components/SiteChrome'
import ScrollToTop from '@/components/ScrollToTop'

const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-work-sans',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://buildwithosim.com'),
  title: {
    default: 'BuildWithOsim — Software Developer & Digital Creator',
    template: '%s | BuildWithOsim',
  },
  description:
    'Osim Uka builds high-performance websites, mobile apps and digital tools that help businesses grow and creators shine.',
  openGraph: {
    title: 'BuildWithOsim — Software Developer & Digital Creator',
    description:
      'High-performance websites, mobile apps and digital tools for businesses and creators.',
    type: 'website',
  },
}

/**
 * Applies the saved theme before first paint.
 *
 * This has to be a blocking inline script: anything running after hydration
 * (including a React effect) is too late and produces a visible flash of the
 * wrong theme. Dark is the default; light is opt-in.
 */
const themeInitScript = `(function(){try{var s=localStorage.getItem('theme');var d=s?s==='dark':true;document.documentElement.classList.toggle('dark',d)}catch(e){document.documentElement.classList.add('dark')}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${workSans.className} ${workSans.variable}`}>
        <Providers>
          <ScrollToTop />
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  )
}
