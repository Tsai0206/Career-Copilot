import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
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
