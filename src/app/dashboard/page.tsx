'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export default function DashboardPage() {
    const supabase = createClient()
    const searchParams = useSearchParams()
    const analysisId = searchParams.get('analysis')
    const [analysis, setAnalysis] = useState<any>(null)
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            if (!analysisId) return

            const { data: analysisData } = await supabase
                .from('job_analyses')
                .select('*')
                .eq('id', analysisId)
                .single()

            setAnalysis(analysisData)

            if (analysisData) {
                const { data: suggestionsData } = await supabase
                    .from('project_suggestions')
                    .select('*')
                    .eq('analysis_id', analysisId)

                setSuggestions(suggestionsData || [])
            }
            setLoading(false)
        }
        loadData()

        // Realtime subscription could go here
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'job_analyses',
                    filter: `id=eq.${analysisId}`,
                },
                (payload) => {
                    setAnalysis(payload.new)
                }
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [analysisId, supabase])

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
    if (!analysis) return <div className="container py-20">No analysis found. <Link href="/analyze" className="text-blue-500">Create one</Link></div>

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">{analysis.role_title || 'Job Analysis'}</h1>
                    <p className="text-[var(--muted)]">{analysis.company_name || 'Pending...'}</p>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-bold text-[var(--primary)]">{analysis.confidence_score || 0}%</div>
                    <div className="text-sm text-[var(--muted)]">Match Confidence</div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="card">
                    <h3 className="font-bold mb-4">Skill Gaps</h3>
                    <div className="flex flex-col gap-2">
                        {analysis.skill_gaps?.missing?.map((skill: string) => (
                            <div key={skill} className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded">
                                <XCircle className="w-4 h-4" /> {skill}
                            </div>
                        ))}
                        {analysis.skill_gaps?.match?.map((skill: string) => (
                            <div key={skill} className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded">
                                <CheckCircle className="w-4 h-4" /> {skill}
                            </div>
                        ))}
                        {(!analysis.skill_gaps || (!analysis.skill_gaps.missing && !analysis.skill_gaps.match)) && (
                            <p className="text-[var(--muted)] italic">Waiting for analysis...</p>
                        )}
                    </div>
                </div>

                <div className="card bg-[var(--secondary)]/10">
                    <h3 className="font-bold mb-4">North Star Projects</h3>
                    <div className="flex flex-col gap-4">
                        {suggestions.map((project) => (
                            <Link key={project.id} href={`/project/${project.id}`} className="block p-4 bg-[var(--card)] border rounded-md hover:border-[var(--primary)] transition-colors">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold">{project.title}</h4>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{project.time_estimate}</span>
                                </div>
                                <p className="text-sm text-[var(--muted)] mt-2 line-clamp-2">{project.north_star_goal}</p>
                                <div className="mt-2 flex gap-2">
                                    <span className="text-xs flex items-center gap-1 text-orange-600"><AlertTriangle className="w-3 h-3" /> {project.difficulty}</span>
                                </div>
                            </Link>
                        ))}
                        {suggestions.length === 0 && <p className="text-[var(--muted)] italic">Generating ideas (running planner-critic loop)...</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}
