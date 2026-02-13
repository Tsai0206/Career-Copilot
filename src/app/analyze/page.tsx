'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight } from 'lucide-react'

export default function AnalyzePage() {
    const supabase = createClient()
    const router = useRouter()
    const [jdText, setJdText] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleAnalyze = async () => {
        if (!jdText.trim()) return
        setLoading(true)
        setError(null)

        try {
            // 1. Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // 2. Insert raw JD into DB first (record the attempt)
            const { data: analysis, error: dbError } = await supabase
                .from('job_analyses')
                .insert({
                    user_id: user.id,
                    jd_raw_text: jdText,
                    status: 'pending' // Note: schema needs status field? Or just check extracted_skills
                })
                .select()
                .single()

            if (dbError) throw dbError

            // 3. Call Edge Function to process (status update happens there)
            // For MVP we await it, but ideally it's async background
            // 3. Call Edge Function to process (status update happens there)
            // For MVP we await it, but ideally it's async background
            const { data: fnData, error: fnError } = await supabase.functions.invoke('parse-jd', {
                body: { analysis_id: analysis.id, jd_text: jdText }
            })

            console.log('Edge Function Response:', fnData, fnError)

            if (fnError) throw fnError
            // Check for error returned in 200 OK body
            if (fnData && fnData.error) {
                throw new Error(`Edge Function Error: ${fnData.error} (Stack: ${fnData.stack})`)
            }

            // 4. Redirect to Dashboard (or specific analysis view)
            router.push(`/dashboard?analysis=${analysis.id}`)

        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Failed to analyze JD')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container py-10 max-w-3xl">
            <h1 className="text-3xl font-bold mb-4">Analyze Job Description</h1>
            <p className="text-[var(--muted)] mb-8">
                Paste the full job description below. Our agents will extract the hidden requirements
                and map them to your profile.
            </p>

            <div className="card">
                <textarea
                    className="w-full h-64 p-4 border rounded-md font-mono text-sm resize-y"
                    placeholder="Paste Job Description here..."
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                />

                <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-[var(--muted)]">
                        {jdText.length} characters
                    </p>
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !jdText.trim()}
                        className="btn btn-primary"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                Analyzing with Agents...
                            </>
                        ) : (
                            <>
                                Start Gap Analysis <ArrowRight className="ml-2 w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
                {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
            </div>
        </div>
    )
}
