import Link from "next/link";
import { ArrowRight, Target, Code, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-20 px-4 flex flex-col items-center text-center bg-[var(--secondary)]/30 border-b border-[var(--border)]">
        <h1 className="text-4xl md:text-6xl font-bold max-w-3xl mb-6">
          Stop Building To-Do Lists. <br />
          <span className="text-[var(--primary)]">Build Your North Star.</span>
        </h1>
        <p className="text-lg text-[var(--muted)] max-w-2xl mb-8">
          The only Career Co-pilot that analyzes your profile against real JDs to generate
          strategic, high-impact side projects you can build in 48 hours.
        </p>
        <Link href="/login" className="btn btn-primary text-base px-8 py-3">
          Get Started <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </section>

      {/* Features Grid */}
      <section className="w-full py-20 bg-[var(--background)]">
        <div className="container grid md:grid-cols-3 gap-8">
          <div className="card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-[var(--primary)]">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Smart Gap Analysis</h3>
            <p className="text-[var(--muted)]">
              We look beyond keywords. Our semantic engine finds the competencies you're missing for that specific JD.
            </p>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 text-green-600">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">North Star Projects</h3>
            <p className="text-[var(--muted)]">
              Get 5-10 tailored project ideas that leverage your unique background ("Private Context") to solve real problems.
            </p>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-purple-600">
              <Code className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Vibe Coding Ready</h3>
            <p className="text-[var(--muted)]">
              Don't start from scratch. Download a "Prompt Pack" to vibe-code your project in Cursor or Replit instantly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
