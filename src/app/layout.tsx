import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Realize Together — Find Your Film Team & Crew',
    template: '%s | Realize Together',
  },
  description:
    'The platform where filmmakers, directors, DPs, writers and producers find each other. NDA-protected pitches, verified portfolios, double opt-in matching.',
  openGraph: {
    type: 'website',
    siteName: 'Realize Together',
    title: 'Realize Together — Find Your Film Team & Crew',
    description:
      'NDA-protected pitches. Verified portfolios. Double opt-in matching. The serious platform for filmmakers.',
    url: 'https://realizetogether.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Realize Together — Find Your Film Team & Crew',
    description:
      'NDA-protected pitches. Verified portfolios. Double opt-in matching. The serious platform for filmmakers.',
  },
  metadataBase: new URL('https://realizetogether.com'),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Unbounded:wght@300;400;700;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
