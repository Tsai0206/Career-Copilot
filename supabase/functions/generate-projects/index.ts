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
        const { analysis_id } = await req.json()
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Fetch Analysis & Profile
        const { data: analysis, error: fetchError } = await supabase
            .from('job_analyses')
            .select('*, profiles:user_id(*)')
            .eq('id', analysis_id)
            .single()

        if (fetchError) throw fetchError

        const jdText = analysis.jd_raw_text
        const resumeText = analysis.profiles.resume_text
        const gaps = analysis.skill_gaps

        // HARDCODED KEY FOR DEBUGGING
        const apiKey = 'AIzaSyA7XoKI9pUgvgh2fCE05bkrQAlttm3LAso';
        const genAI = new GoogleGenerativeAI(apiKey)
        // SWITCH TO GEMINI 2.5 FLASH
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        // 2. Planner-Critic Prompt
        const prompt = `
      You are an expert Engineering Career Coach acting as a "North Star Project Architect."
      
      Task: Generate 5 strategic "North Star" side project ideas for this candidate to land this specific job.
      
      Context:
      - Job Description: ${jdText.substring(0, 3000)}
      - Candidate Resume: ${resumeText.substring(0, 3000)}
      - Missing Skills: ${JSON.stringify(gaps?.missing || [])}
      - Matching Skills: ${JSON.stringify(gaps?.match || [])}

      Constraints (CRITICAL):
      1. Timeframe: Must be buildable in 48 hours to 1 week (MVP).
      2. "Private Context": Must leverage the user's specific background (e.g., if they know Bio, build a Bio tool).
      3. "North Star" Goal: Clear, single-sentence objective (e.g., "Build a dashboard to visualize X").
      
      Process:
      1. Brainstorm 10 ideas.
      2. Critique them against the constraints (especially 48h limit).
      3. Select the top 5 BEST ideas.
      
      Output JSON Format (Array of objects):
      [
        {
          "title": "Project Name",
          "north_star_goal": "One sentence goal...",
          "description": "Short description...",
          "time_estimate": "48h" | "3d" | "1w",
          "difficulty": "Beginner" | "Intermediate",
          "skills_demonstrated": ["skill1", "skill2"],
          "skills_learned": ["gap_skill1", "gap_skill2"]
        }
      ]
    `

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        })
        const response = await result.response
        const suggestions = JSON.parse(response.text())

        // 3. Insert Suggestions
        if (Array.isArray(suggestions)) {
            const inserts = suggestions.map(s => ({
                analysis_id: analysis_id,
                title: s.title,
                north_star_goal: s.north_star_goal,
                description: s.description,
                time_estimate: s.time_estimate,
                difficulty: s.difficulty,
                skills_demonstrated: s.skills_demonstrated,
                skills_learned: s.skills_learned,
                readme_content: null, // Generated on demand
                prompt_pack: null     // Generated on demand
            }))

            const { error: insertError } = await supabase
                .from('project_suggestions')
                .insert(inserts)

            if (insertError) throw insertError
        }

        return new Response(JSON.stringify({ success: true, count: suggestions.length }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
