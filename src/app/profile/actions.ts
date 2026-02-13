'use server'

import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
// @ts-ignore
import pdf from 'pdf-parse/lib/pdf-parse.js'

export async function uploadResumeAction(formData: FormData) {
    const file = formData.get('file') as File
    if (!file) throw new Error('No file uploaded')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 1. Upload to Storage
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/resume.${fileExt}`
    const fileBuffer = await file.arrayBuffer()

    const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, fileBuffer, { upsert: true, contentType: file.type })

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

    // 2. Extract Text
    let text = ''
    try {
        const buffer = Buffer.from(fileBuffer)
        const data = await pdf(buffer)
        text = data.text
    } catch (e) {
        console.error('PDF Parse Error', e)
        throw new Error('Failed to parse PDF text')
    }

    // 3. Generate Embedding
    let embedding = []
    try {
        const apiKey = process.env.GOOGLE_API_KEY
        if (!apiKey) throw new Error('Google API Key not configured')

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'text-embedding-004' })

        const result = await model.embedContent(text.substring(0, 8000))
        embedding = result.embedding.values
    } catch (e) {
        console.error('Embedding Error', e)
        throw new Error('Failed to generate embedding')
    }

    // 4. Update Profile
    const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            resume_url: filePath,
            resume_text: text, // Saving extracted text
            embedding: embedding,
            updated_at: new Date().toISOString(),
        })

    if (updateError) throw updateError
}
