import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { analysis_id, jd_text } = await req.json()
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_API_KEY') ?? '')
        // SWITCH TO GEMINI 2.5 FLASH (Working model)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        // Embedding Model (Assume accurate)
        const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' })

        // 1. Extract Skills & Metadata
        const prompt = `
      Analyze this Job Description and extract the following in JSON format:
      - company_name
      - role_title
      - extracted_skills (array of strings, specific technologies/competencies)
      - extracted_requirements (array of strings, years of exp, degrees, etc)
      
      JD Text:
      ${jd_text.substring(0, 10000)}
    `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        // Simple cleaning of markdown json
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '')
        const data = JSON.parse(jsonStr)

        // 2. Generate Embedding
        const embeddingResult = await embeddingModel.embedContent(jd_text.substring(0, 2000))
        const embedding = embeddingResult.embedding.values

        // 3. Update DB
        const { error } = await supabase
            .from('job_analyses')
            .update({
                company_name: data.company_name,
                role_title: data.role_title,
                extracted_skills: data.extracted_skills,
                extracted_requirements: data.extracted_requirements,
                jd_embedding: embedding,
                confidence_score: 0, // placeholder, updated by analyze-gap
                status: 'parsed' // assuming status column added or logic based on fields
            })
            .eq('id', analysis_id)

        if (error) throw error

        return new Response(JSON.stringify({ success: true, data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        console.error('Edge Function Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
        } catch (error) {
            console.error('Edge Function Error:', error)
            // Return 200 to expose the error message to the client instead of a generic 500
            return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }
    })
