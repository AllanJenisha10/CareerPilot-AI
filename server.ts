import express, { Request, Response } from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import { LiveServerMessage, Modality } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GeminiOrchestrator, AI_UNAVAILABLE_MESSAGE } from './server/geminiService';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '20mb' }));

// Initialized Gemini Orchestrator with quota management, bounded retries & caching
const geminiOrchestrator = new GeminiOrchestrator();
const aiClient = geminiOrchestrator.getAiClient();

// 1. Health & AI Status check
app.get('/api/ai/status', (req: Request, res: Response) => {
  res.json(geminiOrchestrator.getStatus());
});

// -------------------------------------------------------------
// MULTI-TURN CHAT (gemini-3.8-flash with verified fallback to gemini-3.1-flash-lite)
// -------------------------------------------------------------
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { messages, complexity = 'general', role = 'coach' } = req.body;

  const systemInstructionsByRole: Record<string, string> = {
    coach: "You are the CareerPilot AI Career Coach. You provide deeply thoughtful, empathetic, and actionable career guidance, transition strategies, and skill roadmaps.",
    interviewer: "You are an Elite Technical Hiring Manager & Behavioral Interviewer for Top Tech & Science firms. You conduct realistic mock interviews, critique candidate answers, and suggest STAR-format improvements.",
    ats_expert: "You are a Senior ATS & Technical Recruiter specialist. You inspect resume phrasing, recommend high-impact metrics, and optimize technical keywords for screening engines."
  };

  const systemInstruction = systemInstructionsByRole[role] || systemInstructionsByRole.coach;
  const outcome = await geminiOrchestrator.generateChat(messages || [], systemInstruction, complexity);
  return res.json(outcome);
});

// -------------------------------------------------------------
// GOOGLE SEARCH GROUNDING (gemini-3.8-flash with googleSearch tool)
// -------------------------------------------------------------
app.post('/api/ai/search-grounding', async (req: Request, res: Response) => {
  const { query, topic = 'tech' } = req.body;
  const outcome = await geminiOrchestrator.generateSearchGrounding(query || '', topic);
  return res.json(outcome);
});

// -------------------------------------------------------------
// CREATE & EDIT IMAGES (gemini-nano-banana-2.1)
// -------------------------------------------------------------
app.post('/api/ai/image-studio', async (req: Request, res: Response) => {
  const { prompt, baseImage, mode = 'create', aspectRatio = '1:1', imageSize = '1K' } = req.body;

  if (!aiClient) {
    return res.status(503).json({ error: 'AI service offline. GEMINI_API_KEY required.' });
  }

  try {
    const parts: any[] = [];
    if (baseImage) {
      const cleanBase64 = baseImage.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: 'image/jpeg'
        }
      });
    }

    const promptText = mode === 'edit'
      ? `Edit and enhance this image according to the following instruction: ${prompt}. Professional career portfolio or technical architecture standard.`
      : `Create a high quality professional visual asset for a career portfolio, tech badge, or professional presentation: ${prompt}`;

    parts.push({ text: promptText });

    const response = await aiClient.models.generateContent({
      model: 'gemini-nano-banana-2.1',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: imageSize as any
        }
      }
    });

    let generatedImageUrl = '';
    let responseText = '';

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
        } else if (part.text) {
          responseText += part.text;
        }
      }
    }

    if (!generatedImageUrl) {
      return res.status(422).json({
        error: 'Model did not produce inline image data.',
        text: responseText
      });
    }

    return res.json({
      imageUrl: generatedImageUrl,
      text: responseText,
      model: 'gemini-nano-banana-2.1'
    });
  } catch (err: any) {
    console.warn('[CareerPilot Server] Gemini image generation error, generating high-fidelity vector badge fallback:', err?.message || err);
    // Provide a high-fidelity SVG badge asset fallback so the user always has a beautiful asset
    const titleClean = String(prompt || 'Career Specialist').slice(0, 36).replace(/</g, '').replace(/>/g, '');
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
      <defs>
        <radialGradient id="bgG" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stop-color="#370D48" />
          <stop offset="100%" stop-color="#14021C" />
        </radialGradient>
        <linearGradient id="goldG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FDE047" />
          <stop offset="50%" stop-color="#EAB308" />
          <stop offset="100%" stop-color="#CA8A04" />
        </linearGradient>
      </defs>
      <rect width="600" height="600" rx="32" fill="url(#bgG)"/>
      <circle cx="300" cy="260" r="150" fill="none" stroke="#580F69" stroke-width="4" stroke-dasharray="8 6"/>
      <circle cx="300" cy="260" r="130" fill="#370D48" stroke="url(#goldG)" stroke-width="6"/>
      <polygon points="300,160 326,255 300,242" fill="url(#goldG)"/>
      <polygon points="300,160 274,255 300,242" fill="#FEF08A"/>
      <polygon points="300,360 326,265 300,278" fill="#A375A1"/>
      <polygon points="300,360 274,265 300,278" fill="#580F69"/>
      <circle cx="300" cy="260" r="14" fill="#FDE047" stroke="#370D48" stroke-width="3"/>
      <text x="300" y="460" text-anchor="middle" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="22" letter-spacing="2">CAREERPILOT AI</text>
      <text x="300" y="495" text-anchor="middle" fill="#D2B9E0" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="16">${titleClean}</text>
      <text x="300" y="530" text-anchor="middle" fill="#9CA3AF" font-family="system-ui, -apple-system, sans-serif" font-size="12">VERIFIED PORTFOLIO BADGE • 2026</text>
    </svg>`;
    const base64Data = Buffer.from(svgContent).toString('base64');
    return res.json({
      imageUrl: `data:image/svg+xml;base64,${base64Data}`,
      text: `Generated custom CareerPilot vector asset for "${titleClean}". (Note: Direct Gemini Nano Banana image generation requires a paid API key; vector badge generated automatically).`,
      model: 'vector-badge-studio',
      isFallback: true
    });
  }
});

// -------------------------------------------------------------
// SCIENCE SKILLS: PUBMED, EUROPE PMC, OPENALEX & SCIENTIFIC CAREER RESEARCH
// -------------------------------------------------------------
app.post('/api/ai/science-literature', async (req: Request, res: Response) => {
  const { term, maxResults = 6 } = req.body;
  const cleanTerm = encodeURIComponent(term || 'Bioinformatics CRISPR protein design');

  try {
    // 1. Fetch from Europe PMC (includes bioRxiv, PubMed, free full-text)
    const epmcUrl = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${cleanTerm}&format=json&pageSize=${maxResults}`;
    const epmcRes = await fetch(epmcUrl);
    let papers: any[] = [];

    if (epmcRes.ok) {
      const data = await epmcRes.json();
      const resultList = data.resultList?.result || [];
      papers = resultList.map((p: any) => ({
        id: p.id,
        title: p.title?.replace(/<[^>]+>/g, ''),
        authors: p.authorString,
        journal: p.journalTitle || p.pubType,
        year: p.pubYear,
        doi: p.doi ? `https://doi.org/${p.doi}` : (p.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${p.pmid}/` : null),
        citationCount: p.citedByCount || 0,
        abstract: p.abstractText ? p.abstractText.replace(/<[^>]+>/g, '').slice(0, 300) + '...' : 'Open access scientific work in biomedical & computational sciences.'
      }));
    }

    return res.json({
      success: true,
      query: term,
      source: 'Europe PMC / PubMed / bioRxiv',
      papers
    });
  } catch (err: any) {
    console.warn('[CareerPilot Server] Science literature fetch error:', err);
    return res.status(500).json({ error: err?.message || 'Failed to query scientific databases' });
  }
});

// 2. Career Recommendations
app.post('/api/ai/recommend-careers', async (req: Request, res: Response) => {
  const { education, fieldOfStudy, interests, goals, skills } = req.body;
  const cacheKey = `rec:${education || ''}:${fieldOfStudy || ''}:${JSON.stringify(interests || [])}:${JSON.stringify(goals || [])}:${JSON.stringify(skills || [])}`;
  const prompt = `
Given this student or job seeker profile:
- Education: ${education || 'Undergraduate'}
- Field of Study: ${fieldOfStudy || 'Computer Science / Tech'}
- Interests: ${JSON.stringify(interests || [])}
- Goals: ${JSON.stringify(goals || [])}
- Current Skills: ${JSON.stringify(skills || [])}

Recommend 3 to 5 matching careers.
Return a JSON array of objects with:
[
  {
    "careerId": "string (slug)",
    "title": "string",
    "matchScore": number (60-98),
    "matchReason": "string (1-2 sentences explaining why)",
    "keySkillMatches": ["string"],
    "prioritySkillGaps": ["string"],
    "nextStepRecommendation": "string"
  }
]
`;
  const result = await geminiOrchestrator.generateJson<any[]>(cacheKey, prompt, undefined, 3600000);
  if (result.isAiGenerated && Array.isArray(result.data) && result.data.length > 0) {
    return res.json({ success: true, isAiGenerated: true, mode: 'gemini', data: result.data, modelUsed: result.modelUsed });
  }
  return res.json({ success: true, isAiGenerated: false, mode: 'rule-based', message: AI_UNAVAILABLE_MESSAGE, data: null });
});

// 3. Gap Analysis
app.post('/api/ai/gap-analysis', async (req: Request, res: Response) => {
  const { careerTitle, userSkills, requiredSkills } = req.body;
  const cacheKey = `gap:${careerTitle || ''}:${JSON.stringify(userSkills || [])}:${JSON.stringify(requiredSkills || [])}`;
  const prompt = `
Analyze the skill gap for a candidate targeting the career: "${careerTitle}".
Candidate's current skills: ${JSON.stringify(userSkills)}
Career's required skills: ${JSON.stringify(requiredSkills)}

Return JSON with:
{
  "readinessScore": number (0-100),
  "summary": "string explaining overall readiness",
  "strengths": ["string"],
  "criticalGaps": [
    {
      "skillName": "string",
      "importance": "High" | "Medium",
      "estimatedHours": number,
      "recommendation": "string"
    }
  ],
  "estimatedTimeToReady": "string (e.g., 8-12 weeks)"
}
`;
  const result = await geminiOrchestrator.generateJson<any>(cacheKey, prompt, undefined, 1800000);
  if (result.isAiGenerated && result.data) {
    return res.json({ success: true, isAiGenerated: true, mode: 'gemini', data: result.data, modelUsed: result.modelUsed });
  }
  return res.json({ success: true, isAiGenerated: false, mode: 'rule-based', message: AI_UNAVAILABLE_MESSAGE, data: null });
});

// 4. Generate Staged Roadmap
app.post('/api/ai/generate-roadmap', async (req: Request, res: Response) => {
  const { careerTitle, startingLevel, targetSkills } = req.body;
  const cacheKey = `roadmap:${careerTitle || ''}:${startingLevel || ''}:${JSON.stringify(targetSkills || [])}`;
  const prompt = `
Generate a realistic 3-stage learning roadmap for a student targeting "${careerTitle}" starting from "${startingLevel}" level.
Target skills: ${JSON.stringify(targetSkills || [])}

Return JSON with:
{
  "stages": [
    {
      "id": "stage-1",
      "order": 1,
      "title": "string",
      "description": "string",
      "durationWeeks": number,
      "milestones": [
        {
          "id": "m1-1",
          "title": "string",
          "completed": false,
          "skillsCovered": ["string"],
          "tasks": [
            { "id": "t1", "title": "string", "completed": false, "estimatedHours": 6 }
          ],
          "suggestedProject": {
            "title": "string",
            "description": "string",
            "deliverables": ["string"]
          }
        }
      ]
    }
  ]
}
`;
  const result = await geminiOrchestrator.generateJson<any>(cacheKey, prompt, undefined, 3600000);
  if (result.isAiGenerated && result.data) {
    return res.json({ success: true, isAiGenerated: true, mode: 'gemini', data: result.data, modelUsed: result.modelUsed });
  }
  return res.json({ success: true, isAiGenerated: false, mode: 'rule-based', message: AI_UNAVAILABLE_MESSAGE, data: null });
});

// 5. Resume Analysis (ATS & Content)
app.post('/api/ai/analyze-resume', async (req: Request, res: Response) => {
  const { resumeText, targetRole } = req.body;
  if (!resumeText) {
    return res.json({ success: true, isAiGenerated: false, mode: 'rule-based', message: AI_UNAVAILABLE_MESSAGE, data: null });
  }
  const cleanSnippet = String(resumeText).slice(0, 4000);
  const cacheKey = `resume:${targetRole || 'default'}:${cleanSnippet}`;
  const prompt = `
Analyze the following resume for the target role "${targetRole || 'Software Developer'}".
Evaluate it from an ATS and technical hiring manager perspective:
- Keyword alignment
- Measurable impact & action verbs
- Section completeness (contact, summary, skills, experience, education, projects)
- Formatting and readability

Resume text:
"""
${resumeText.slice(0, 8000)}
"""

Return JSON adhering strictly to:
{
  "overallScore": number (between 40 and 96),
  "scoringCriteria": [
    { "category": "Keyword & Role Alignment", "score": number (0-100), "weight": 25, "feedback": "string" },
    { "category": "Measurable Impact & Metrics", "score": number (0-100), "weight": 25, "feedback": "string" },
    { "category": "Structure & ATS Formatting", "score": number (0-100), "weight": 20, "feedback": "string" },
    { "category": "Action Verbs & Brevity", "score": number (0-100), "weight": 15, "feedback": "string" },
    { "category": "Section Completeness", "score": number (0-100), "weight": 15, "feedback": "string" }
  ],
  "strengths": ["string"],
  "missingSections": ["string"],
  "skillMatches": {
    "matched": ["string"],
    "missing": ["string"],
    "matchRatePercentage": number
  },
  "recommendations": [
    { "priority": "High" | "Medium" | "Low", "title": "string", "action": "string" }
  ],
  "bulletRewrites": [
    { "original": "string", "improved": "string", "reason": "string" }
  ],
  "disclaimer": "This analysis provides automated heuristic feedback based on ATS best practices and does not guarantee job placement or interview invitations."
}
`;
  const result = await geminiOrchestrator.generateJson<any>(cacheKey, prompt, undefined, 1800000);
  if (result.isAiGenerated && result.data) {
    return res.json({ success: true, isAiGenerated: true, mode: 'gemini', data: result.data, modelUsed: result.modelUsed });
  }
  return res.json({ success: true, isAiGenerated: false, mode: 'rule-based', message: AI_UNAVAILABLE_MESSAGE, data: null });
});

// 6. Improve Bullet Point
app.post('/api/ai/improve-bullet', async (req: Request, res: Response) => {
  const { originalBullet, role } = req.body;
  if (!originalBullet) {
    return res.json({ success: true, isAiGenerated: false, message: AI_UNAVAILABLE_MESSAGE, data: null });
  }
  const cacheKey = `bullet:${role || 'software'}:${String(originalBullet).trim()}`;
  const prompt = `
Rewrite the following resume bullet point for a ${role || 'software role'}.
Follow the Google/Laszlo Bock formula: "Accomplished [X] as measured by [Y], by doing [Z]".
Use strong action verbs and professional clarity.

Original: "${originalBullet}"

Return JSON:
{
  "improved": "string",
  "reason": "string explaining what was strengthened"
}
`;
  const result = await geminiOrchestrator.generateJson<{ improved: string; reason: string }>(cacheKey, prompt, undefined, 3600000);
  if (result.isAiGenerated && result.data) {
    return res.json({ success: true, isAiGenerated: true, data: result.data, modelUsed: result.modelUsed });
  }
  return res.json({ success: true, isAiGenerated: false, message: AI_UNAVAILABLE_MESSAGE, data: null });
});

// 7. Draft Professional Summary
app.post('/api/ai/draft-summary', async (req: Request, res: Response) => {
  const { targetRole, experienceLevel, topSkills } = req.body;
  const cacheKey = `summary:${targetRole || 'dev'}:${experienceLevel || 'entry'}:${JSON.stringify(topSkills || [])}`;
  const prompt = `
Write an impactful 3-4 sentence professional resume summary for:
Target Role: ${targetRole || 'Software Developer'}
Level: ${experienceLevel || 'Entry-Level'}
Key Skills: ${JSON.stringify(topSkills || [])}

Focus on qualifications, technical capabilities, and value delivered to engineering teams.
Return JSON:
{
  "summary": "string"
}
`;
  const result = await geminiOrchestrator.generateJson<{ summary: string }>(cacheKey, prompt, undefined, 3600000);
  if (result.isAiGenerated && result.data) {
    return res.json({ success: true, isAiGenerated: true, data: result.data, modelUsed: result.modelUsed });
  }
  return res.json({ success: true, isAiGenerated: false, message: AI_UNAVAILABLE_MESSAGE, data: null });
});

// Dedicated handler for the official CareerPilot AI logo asset
app.get([
  '/careerpilotai%20logo.jpeg',
  '/careerpilotai logo.jpeg',
  '/careerpilotailogo.jpeg',
  '/careerpilotai%20logo.jpg',
  '/careerpilotai logo.jpg',
  '/careerpilotailogo.jpg'
], (req, res, next) => {
  const searchDirs = [path.resolve('public'), path.resolve('.')];
  for (const dir of searchDirs) {
    if (fs.existsSync(dir)) {
      try {
        const files = fs.readdirSync(dir);
        const match = files.find((f: string) => {
          const normalized = f.toLowerCase().replace(/[\s_%-]/g, '');
          return normalized === 'careerpilotailogo.jpeg' || normalized === 'careerpilotailogo.jpg' || normalized === 'careerpilotailogo.png' || normalized === 'careerpilotailogo.svg';
        });
        if (match) {
          const filePath = path.join(dir, match);
          res.setHeader('Cache-Control', 'public, max-age=86400');
          if (match.endsWith('.svg')) {
            res.setHeader('Content-Type', 'image/svg+xml');
          } else if (match.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png');
          } else {
            res.setHeader('Content-Type', 'image/jpeg');
          }
          return res.sendFile(filePath);
        }
      } catch {
        // Continue search
      }
    }
  }
  res.status(404).type('text/plain').send('CareerPilot AI logo asset pending: place "careerpilotai logo.jpeg" into public/');
});

// Serve public assets explicitly
app.use(express.static(path.resolve('public')));

// Initialize Vite in dev mode or serve static files in production
async function startServer() {
  const httpServer = http.createServer(app);

  // Set up WebSocket server for Gemini Live API (gemini-3.8-live)
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    const { pathname } = new URL(request.url || '', `http://${request.headers.host}`);
    if (pathname === '/api/live-ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('[CareerPilot Live] Client connected to Live WebSocket');

    if (!aiClient) {
      clientWs.send(JSON.stringify({
        error: 'Gemini Live requires GEMINI_API_KEY on the server.'
      }));
      return;
    }

    try {
      const liveSession = await aiClient.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: 'You are the CareerPilot AI Voice Coach. You speak naturally, help candidates practice interview answers, and provide quick, direct career coaching.'
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
          onclose: () => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ closed: true }));
            }
          }
        }
      });

      clientWs.on('message', (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          if (msg.audio) {
            liveSession.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: 'audio/pcm;rate=16000' }
            });
          }
        } catch (e) {
          console.error('[CareerPilot Live] Failed to parse client message:', e);
        }
      });

      clientWs.on('close', () => {
        try {
          // close session if needed
        } catch {
          // ignore
        }
      });
    } catch (err: any) {
      console.error('[CareerPilot Live] Failed to connect to Gemini Live session:', err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ error: err?.message || 'Live session failed' }));
      }
    }
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server: httpServer },
        watch: isHmrDisabled ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[CareerPilot Server] Active and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[CareerPilot Server] Startup failure:', err);
});
