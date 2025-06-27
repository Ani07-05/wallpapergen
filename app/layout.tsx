import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;500;600&family=Cinzel+Decorative:wght@400;700&family=Uncial+Antiqua&family=Noto+Sans+Devanagari:wght@300;400;500;600;700;800;900&family=Noto+Serif+Devanagari:wght@300;400;500;600;700;800;900&family=Kalam:wght@300;400;700&family=Hind:wght@300;400;500;600;700&family=Mukti:wght@400;700&family=Tiro+Devanagari+Hindi:ital@0;1&family=Baloo+2:wght@400;500;600;700;800&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Shrikhand&family=Marathi+Cursive:wght@400;700&family=Geist+Sans:wght@300;400;500;600;700;800;900&family=Geist+Mono:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}

