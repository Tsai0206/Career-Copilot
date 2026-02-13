'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Download, Copy, ExternalLink, ArrowLeft } from 'lucide-react'
import { jsPDF } from 'jspdf'

export default function ProjectPage() {
    const params = useParams()
    const id = params?.id as string
    const supabase = createClient()
    const [project, setProject] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            if (!id) return

            const { data } = await supabase
                .from('project_suggestions')
                .select('*')
                .eq('id', id)
                .single()
            setProject(data)
            setLoading(false)
        }
        loadData()
    }, [id, supabase])

    const copyToClipboard = (text: string) => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(text)
            alert('Copied to clipboard!')
        }
    }

    const downloadPDF = () => {
        if (!project) return
        const doc = new jsPDF()
        doc.setFontSize(20)
        doc.text(project.title, 10, 10)

        doc.setFontSize(12)
        const splitGoal = doc.splitTextToSize(`Goal: ${project.north_star_goal}`, 180)
        doc.text(splitGoal, 10, 25)

        // Add more content... (Simple MVP version)
        doc.text(`Difficulty: ${project.difficulty}`, 10, 40)
        doc.text(`Time Estimate: ${project.time_estimate}`, 10, 50)

        doc.save(`${project.title.replace(/\s+/g, '_')}_Plan.pdf`)
    }

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
    if (!project) return <div className="container py-20">Project not found.</div>

    return (
        <div className="container py-10 max-w-4xl">
            <Link href="/dashboard" className="flex items-center text-sm text-[var(--muted)] mb-6 hover:text-[var(--primary)]">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                    <p className="text-lg text-[var(--muted)]">{project.north_star_goal}</p>
                </div>
                <button onClick={downloadPDF} className="btn btn-primary shrink-0">
                    <Download className="w-4 h-4 mr-2" /> Download Plan
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Main Content (README) */}
                <div className="md:col-span-2 flex flex-col gap-8">
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">Implementation Plan</h2>
                        <div className="prose max-w-none whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-md overflow-x-auto">
                            {project.readme_content || 'No README generated yet.'}
                        </div>
                    </div>
                </div>

                {/* Sidebar (Prompt Pack & Resources) */}
                <div className="flex flex-col gap-6">
                    <div className="card bg-purple-50 border-purple-200">
                        <h3 className="font-bold mb-4 text-purple-900">Vibe Coding Prompt Pack</h3>
                        <div className="flex flex-col gap-3">
                            {project.prompt_pack?.map((prompt: any, i: number) => (
                                <div key={i} className="bg-white p-3 rounded border border-purple-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold uppercase text-purple-600">{prompt.tool || 'Cursor'}</span>
                                        <button onClick={() => copyToClipboard(prompt.prompt)} title="Copy Prompt">
                                            <Copy className="w-3 h-3 text-[var(--muted)] hover:text-purple-600" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-2">{prompt.title}</p>
                                </div>
                            ))}
                            {(!project.prompt_pack || project.prompt_pack.length === 0) && (
                                <p className="text-sm text-[var(--muted)]">No prompts generated.</p>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="font-bold mb-4">Resources</h3>
                        <ul className="flex flex-col gap-2">
                            {project.resources?.map((res: any, i: number) => (
                                <li key={i}>
                                    <a href={res.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-start gap-2">
                                        <ExternalLink className="w-3 h-3 mt-1 shrink-0" /> {res.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
