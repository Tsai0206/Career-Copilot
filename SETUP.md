# Career Co-pilot Setup

## 1. API Keys Required
The application uses Google Gemini (via Google AI Studio) for both the LLM and Embeddings.

### A. Environment Variables (.env.local)
You need to add your Google API Key to `.env.local` for the backend server actions (Resume parsing).
1. Open `.env.local` in `career-copilot`.
2. Add:
   ```env
   GOOGLE_API_KEY=AIzaSyA7XoKI9pUgvgh2fCE05bkrQAlttm3LAso
   ```

### B. Supabase Secrets (For Edge Functions)
The AI Agents run on Supabase Edge Functions. They also need the key.
1. Run this command in your terminal (if you have Supabase CLI installed):
   ```bash
   npx supabase secrets set GOOGLE_API_KEY=AIzaSyA7XoKI9pUgvgh2fCE05bkrQAlttm3LAso
   ```
   **OR**
2. Go to your Supabase Project Dashboard -> Settings -> Edge Functions -> Secrets.
   - Add new secret: Name `GOOGLE_API_KEY`, Value `your_key`.

## 2. Running the App
```bash
cd career-copilot
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

## 3. Workflow
1. **Login/Signup**: Create an account.
2. **Profile**: Fill details and upload your Resume (PDF). *It will be parsed and embedded automatically.*
3. **Analyze**: Paste a Job Description.
   - The Agent will extract requirements.
   - It will identify gaps vs your resume.
4. **Dashboard**: View the gap analysis.
   - The "Planner Agent" will generate 5 North Star projects.
5. **Project View**: Click a project to see the plan.
   - If "Implementation Plan" is empty, it will generate it on the fly (wait a few seconds).
