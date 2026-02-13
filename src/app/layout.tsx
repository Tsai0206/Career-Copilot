import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Career Co-pilot | Project Catalyst",
  description: "Generate strategic 'North Star' side projects to land your dream job.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="border-b border-[var(--border)] py-4">
          <div className="container flex items-center justify-between">
            <a href="/" className="text-xl font-bold flex items-center gap-2">
              🚀 Career Co-pilot
            </a>
            <div className="flex gap-4">
              <a href="/login" className="text-sm font-medium hover:text-[var(--primary)]">Login</a>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
