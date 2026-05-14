import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SIDEKICK — AI Sales Co-Pilot',
  description: 'Koleksi prompt AI berstruktur untuk seller Malaysia. Jual lebih berkesan di media sosial.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ms" className={jakarta.variable}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
