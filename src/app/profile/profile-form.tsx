'use client'

import { createClient } from '@/utils/supabase/client'
import { type User } from '@supabase/supabase-js'
import { useState, useCallback } from 'react'
import { Loader2 } from 'lucide-react'

export default function ProfileForm({ user, profile }: { user: User; profile: any }) {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    const [fullname, setFullname] = useState(profile?.full_name || '')
    const [title, setTitle] = useState(profile?.title || '')
    const [targetRole, setTargetRole] = useState(profile?.target_role || '')

    const updateProfile = useCallback(async () => {
        setLoading(true)
        setMessage(null)

        try {
            const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                full_name: fullname,
                title,
                target_role: targetRole,
                updated_at: new Date().toISOString(),
            })
            if (error) throw error
            setMessage('Profile updated!')
        } catch (error) {
            console.error(error)
            setMessage('Error updating profile')
        } finally {
            setLoading(false)
        }
    }, [user, fullname, title, targetRole, supabase])

    const uploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return
        const file = e.target.files[0]
        setLoading(true)

        try {
            const fileExt = file.name.split('.').pop()
            const filePath = `${user.id}/resume.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(filePath, file, { upsert: true })

            if (uploadError) throw uploadError

            const { error: updateError } = await supabase.from('profiles').upsert({
                id: user.id,
                resume_url: filePath,
                updated_at: new Date().toISOString(),
            })

            if (updateError) throw updateError

            setMessage('Resume uploaded!')
        } catch (error) {
            console.error(error)
            setMessage('Error uploading resume')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Full Name</label>
                <input
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    className="p-2 border rounded-md"
                    placeholder="e.g. Marvin Tsai"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Current Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="p-2 border rounded-md"
                    placeholder="e.g. BME Master's Student"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Target Role (North Star)</label>
                <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="p-2 border rounded-md"
                    placeholder="e.g. Medical Device R&D Engineer"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Resume (PDF)</label>
                <input
                    type="file"
                    accept=".pdf"
                    onChange={uploadResume}
                    className="p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {profile?.resume_url && <p className="text-xs text-green-600">Resume uploaded ✅</p>}
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={updateProfile}
                    disabled={loading}
                    className="btn btn-primary w-full md:w-auto"
                >
                    {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                    {loading ? 'Saving...' : 'Save Profile'}
                </button>
                {message && <span className="text-sm text-[var(--muted)]">{message}</span>}
            </div>

            <div className="border-t pt-6 mt-2">
                <a href="/analyze" className={`btn btn-secondary w-full ${!profile?.resume_url ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    Next: Analyze Job Description <code className="ml-2">→</code>
                </a>
            </div>
        </div>
    )
}
