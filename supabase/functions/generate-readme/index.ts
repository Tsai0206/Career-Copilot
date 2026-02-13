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
        const { suggestion_id } = await req.json()
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Fetch Suggestions & Context
        const { data: suggestion, error: fetchError } = await supabase
            .from('project_suggestions')
            .select('*, job_analyses(jd_raw_text, profiles(resume_text))')
            .eq('id', suggestion_id)
            .single()

        if (fetchError) throw fetchError

        const jdText = suggestion.job_analyses.jd_raw_text
        const resumeText = suggestion.job_analyses.profiles.resume_text

        const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_API_KEY') ?? '')
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        // 2. README + Prompt Pack Generation
        const prompt = `
      You are an expert Engineering Career Coach.
      
      Task: Generate a comprehensive README and a "Vibe Coding Prompt Pack" for the selected project.
      
      Project: ${suggestion.title}
      Goal: ${suggestion.north_star_goal}
      Description: ${suggestion.description}
      
      Context:
      - JD: ${jdText.substring(0, 2000)}
      - Resume: ${resumeText.substring(0, 2000)}

      Requirements:
      1. README: Markdown format. Structure: Use Case, Technologies, Implementation Steps, Private Context Moat.
      2. Prompt Pack: Array of prompts to be used in AI Editors (Cursor/Replit) to build this project fast.
      
      Output JSON Format:
      {
        "readme_content": "# Project Title\\n\\n...",
        "prompt_pack": [
          {
            "title": "Initial Scaffold",
            "tool": "Cursor",
            "prompt": "Create a Next.js app with..."
          },
          {
            "title": "Database Schema",
            "tool": "Supabase",
            "prompt": "Create a table for..."
          }
        ],
        "resources": [
          { "title": "Resource 1", "url": "https://...", "type": "Documentation" }
        ]
      }
    `

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        })
        const response = await result.response
        const data = JSON.parse(response.text())

        // 3. Update DB
        const { error: updateError } = await supabase
            .from('project_suggestions')
            .update({
                readme_content: data.readme_content,
                prompt_pack: data.prompt_pack,
                resources: data.resources
            })
            .eq('id', suggestion_id)

        if (updateError) throw updateError

        return new Response(JSON.stringify({ success: true, data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
