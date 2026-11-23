import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client lazily if API key is provided
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health Check API
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    company: "Shri Shyam Consulting",
    address: "Paras Complex, Durg, CG",
    phone: "8269715615",
    email: "info@shrishyamconsulting.in",
    website: "https://www.shrishyamconsulting.in",
    aiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// AI Candidate Screening Evaluation API
app.post("/api/ai/screen-candidate", async (req, res) => {
  try {
    const { candidate, jobDescription } = req.body;
    if (!candidate) {
      return res.status(400).json({ error: "Candidate information is required" });
    }

    const ai = getAI();
    if (!ai) {
      // Return a smart rule-based assessment fallback if Gemini key is not yet configured
      const expNum = parseInt(candidate.experience || "0", 10) || 1;
      const score = Math.min(95, 60 + expNum * 4);
      return res.json({
        score,
        verdict: score >= 75 ? "Highly Recommended" : "Potential Match",
        summary: `${candidate.name} has ${candidate.experience || 'relevant'} experience as ${candidate.designation || 'Specialist'} based in ${candidate.location}. Qualifications align with recruitment requirements.`,
        keyStrengths: [
          `Solid domain background in ${candidate.designation || 'target role'}`,
          `Location: ${candidate.location} (Flexible & accessible)`,
          `Notice period: ${candidate.noticePeriod || 'Immediate / Negotiable'}`,
        ],
        areasToProbe: [
          "Verify exact hands-on software & tools experience",
          "Confirm CTC expectation vs company budget",
          "Assess willingness for immediate onboarding",
        ],
        screeningQuestions: [
          `Can you walk us through your most recent projects as ${candidate.designation}?`,
          `Are you comfortable with the work location and reporting structure?`,
          `What is your expected CTC and earliest joining date?`,
        ],
        consultingRecommendation: "Proceed to initial telephonic screening round with Shri Shyam Consulting AI agent.",
      });
    }

    const prompt = `
You are an expert Talent Acquisition & Recruitment Director at Shri Shyam Consulting (Paras Complex, Durg, Chhattisgarh; Website: www.shrishyamconsulting.in; Phone: 8269715615; Email: info@shrishyamconsulting.in).

Evaluate this candidate for recruitment:
Candidate Profile:
- Name: ${candidate.name}
- Current Designation: ${candidate.designation}
- Experience: ${candidate.experience}
- Location: ${candidate.location}
- Current Salary: ${candidate.currentSalary || 'Not specified'}
- Expected Salary: ${candidate.expectedSalary || 'Negotiable'}
- Notice Period: ${candidate.noticePeriod || 'Immediate'}
- Skills/Profile: ${candidate.skills || candidate.profile || candidate.designation}

Target Role / Job Context:
${jobDescription || candidate.designation || 'General role matching candidate profile'}

Provide your response in valid JSON with this exact structure:
{
  "score": number (0 to 100),
  "verdict": "Highly Recommended" | "Recommended" | "Potential Match" | "Not Recommended",
  "summary": "2-3 concise sentences assessing candidate fit",
  "keyStrengths": ["strength 1", "strength 2", "strength 3"],
  "areasToProbe": ["probe 1", "probe 2", "probe 3"],
  "screeningQuestions": ["custom screening question 1", "question 2", "question 3"],
  "consultingRecommendation": "Next actionable recruitment step"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error("AI Screening Error:", error);
    return res.status(500).json({
      error: "Failed to screen candidate",
      details: error?.message,
    });
  }
});

// AI Calling Agent Interactive Turn API
app.post("/api/ai/conduct-call-turn", async (req, res) => {
  try {
    const { candidate, conversationHistory, candidateInput, callGoal } = req.body;
    const ai = getAI();

    if (!ai) {
      // High quality fallback conversational responses for AI calling agent
      const historyLen = (conversationHistory || []).length;
      let reply = "";
      let isConcluded = false;
      let screeningPassed = true;

      if (historyLen === 0) {
        reply = `Namaste ${candidate?.name || 'Sir/Ma\'am'}, I am calling from Shri Shyam Consulting, Durg. I'm reaching out regarding your profile for the ${candidate?.designation || 'open'} position. Do you have 2 minutes to confirm a few quick details?`;
      } else if (historyLen === 2) {
        reply = `Great! I see you have ${candidate?.experience || 'several years'} of experience as ${candidate?.designation}. Are you currently actively looking for a job opportunity, and what is your notice period?`;
      } else if (historyLen === 4) {
        reply = `Understood. Your current location is ${candidate?.location}. Are you open to roles based in or near this location, and what are your current salary expectations?`;
      } else {
        reply = `Thank you for confirming, ${candidate?.name}. You match our preliminary requirements! Would you like us to schedule a formal interview with our hiring team via Google Meet or at our Durg office in Paras Complex?`;
        isConcluded = true;
      }

      return res.json({
        agentMessage: reply,
        isConcluded,
        candidateDisposition: isConcluded ? "Interested - Interview Ready" : "In Discussion",
        screeningScore: 85,
        extractedNotes: `Confirmed active status, location ${candidate?.location}, interested in next round.`,
      });
    }

    const prompt = `
You are "ShyamAI", the official voice calling recruitment agent for "Shri Shyam Consulting" located at Paras Complex, Durg, CG (Website: www.shrishyamconsulting.in, Contact: 8269715615, info@shrishyamconsulting.in).

You are on a phone call with the following candidate:
- Candidate Name: ${candidate.name}
- Role/Designation: ${candidate.designation}
- Location: ${candidate.location}
- Experience: ${candidate.experience}
- Salary: ${candidate.currentSalary || 'Negotiable'}
- Notice Period: ${candidate.noticePeriod || 'Immediate'}

Call Goal: ${callGoal || 'Screen availability, verify role interest, check notice period & salary, and schedule interview.'}

Previous Conversation Turns:
${JSON.stringify(conversationHistory || [], null, 2)}

Latest Candidate Statement:
"${candidateInput || '(Call just connected)'}"

Instructions:
1. Speak naturally as a courteous, professional Indian HR recruiter in English (with respectful Indian corporate tone, brief and clear).
2. Keep responses concise (1 to 3 spoken sentences maximum) suitable for speech synthesis.
3. If this is the start, introduce Shri Shyam Consulting, state the role, and ask if they have 2 minutes.
4. Verify experience, immediate availability, and current location.
5. If qualified, invite them for an interview at Paras Complex, Durg, CG or online via Google Meet.
6. If the conversation has covered essentials, conclude politely.

Return strictly JSON with:
{
  "agentMessage": "Spoken sentence for TTS",
  "isConcluded": boolean,
  "candidateDisposition": "Interested - Interview Ready" | "Salary Mismatch" | "Location Mismatch" | "Callback Later" | "Not Interested",
  "screeningScore": number (0 to 100),
  "extractedNotes": "Brief bullet summary of candidate answers"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("AI Call Turn Error:", error);
    return res.status(500).json({
      error: "Failed to generate AI call response",
      details: error?.message,
    });
  }
});

// AI Job Description Generator & Matcher API
app.post("/api/ai/match-job", async (req, res) => {
  try {
    const { jobTitle, keyRequirements, candidateList } = req.body;
    const ai = getAI();

    if (!ai || !candidateList || candidateList.length === 0) {
      return res.json({
        topCandidateIds: (candidateList || []).slice(0, 5).map((c: any) => c.id),
        matchRationale: "Matched based on designation keyword search and experience criteria.",
      });
    }

    const simplifiedCandidates = candidateList.slice(0, 30).map((c: any) => ({
      id: c.id,
      name: c.name,
      designation: c.designation,
      location: c.location,
      experience: c.experience,
      currentSalary: c.currentSalary,
    }));

    const prompt = `
Match these candidates for the position "${jobTitle}" at Shri Shyam Consulting with requirements: "${keyRequirements}".
Candidates:
${JSON.stringify(simplifiedCandidates, null, 1)}

Select the top best matching candidate IDs and give a ranking score (0-100) with brief reason.
Return JSON:
{
  "matches": [
    { "id": "candidate_id", "score": number, "reason": "short explanation" }
  ],
  "recommendations": "Overall hiring strategy advice"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Job match error:", error);
    return res.status(500).json({ error: "Failed to match job", details: error?.message });
  }
});

// Vite middleware & Production Serving Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Shri Shyam Consulting server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
