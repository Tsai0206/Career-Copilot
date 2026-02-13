import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Cosine similarity for generic vectors
function cosineSimilarity(xs, ys) {
    let product = 0.0;
    let normx = 0.0;
    let normy = 0.0;
    for (let i = 0; i < xs.length; i++) {
        product += xs[i] * ys[i];
        normx += xs[i] * xs[i];
        normy += ys[i] * ys[i];
    }
    return product / (Math.sqrt(normx) * Math.sqrt(normy));
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

        // 1. Fetch Data
        const { data: analysis, error: fetchError } = await supabase
            .from('job_analyses')
            .select('*, profiles:user_id(*)')
            .eq('id', analysis_id)
            .single()

        if (fetchError) throw fetchError
        if (!analysis.profiles) throw new Error('User profile not found')

        const jdText = analysis.jd_raw_text
        const resumeText = analysis.profiles.resume_text || 'No resume text'
        const jdEmbed = JSON.parse(analysis.jd_embedding)
        const profileEmbed = JSON.parse(analysis.profiles.embedding)

        // 2. Score
        let score = 0
        if (jdEmbed && profileEmbed) {
            score = cosineSimilarity(jdEmbed, profileEmbed) * 100
        }

        // HARDCODED KEY FOR DEBUGGING
        const apiKey = 'AIzaSyA7XoKI9pUgvgh2fCE05bkrQAlttm3LAso';
        const genAI = new GoogleGenerativeAI(apiKey)
        // SWITCH TO GEMINI 2.5 FLASH
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const prompt = `
      Compare the Job Description (JD) and the Candidate Profile.
      Identify:
      1. Matching Skills (competencies user has)
      2. Missing Skills (critical gaps in JD not in Profile)
      
      JD: ${jdText.substring(0, 5000)}
      Profile: ${resumeText.substring(0, 5000)}

      Output JSON:
      {
        "match": ["skill 1", "skill 2"],
        "missing": ["skill 3", "skill 4"]
      }
    `
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        })
        const response = await result.response
        const gaps = JSON.parse(response.text())

        // 4. Update DB
        const { error: updateError } = await supabase
            .from('job_analyses')
            .update({
                confidence_score: score,
                skill_gaps: gaps,
                status: 'analyzed'
            })
            .eq('id', analysis_id)

        if (updateError) throw updateError

        // 5. Trigger Generate Projects (Chain)
        // Optionally trigger the next step directly
        await supabase.functions.invoke('generate-projects', {
            body: { analysis_id }
        })

        return new Response(JSON.stringify({ success: true, score, gaps }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
