import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});


export const metadata: Metadata = {
  title: "SCAI – STEM Connect Attendee Index",
  description:
    "A scoring model that gives every attendee a score from 0–100 across five weighted pillars. Submission for the Technical Assistant role at Payaza Africa.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:ital,wght@0,100..900;1,100..900&family=Glegoo:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="noise-bg min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
