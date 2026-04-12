import { corsHeaders } from "@supabase/supabase-js/cors";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const staffFile = formData.get("staffAnswer") as File | null;
    const studentFile = formData.get("studentAnswer") as File | null;

    if (!staffFile || !studentFile) {
      return new Response(
        JSON.stringify({ error: "Both staffAnswer and studentAnswer PDF files are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract text from PDFs using pdf-parse
    const staffText = await extractTextFromPdf(staffFile);
    const studentText = await extractTextFromPdf(studentFile);

    if (!staffText.trim() || !studentText.trim()) {
      return new Response(
        JSON.stringify({ error: "Could not extract text from one or both PDFs. Ensure they contain readable text (not scanned images)." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Call Lovable AI for evaluation
    const evaluationResult = await evaluateWithAI(staffText, studentText, LOVABLE_API_KEY);

    return new Response(JSON.stringify(evaluationResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("evaluate error:", e);

    const status = (e as any)?.status || 500;
    const message = e instanceof Error ? e.message : "Unknown error";

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ─── PDF Text Extraction ───
async function extractTextFromPdf(file: File): Promise<string> {
  // Read raw bytes and do a basic text extraction from PDF
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const text = extractTextFromPdfBytes(bytes);
  return text;
}

function extractTextFromPdfBytes(bytes: Uint8Array): string {
  // Decode the PDF as latin1 to preserve byte values
  const raw = new TextDecoder("latin1").decode(bytes);

  const textParts: string[] = [];

  // Strategy 1: Extract text between BT...ET blocks (standard PDF text objects)
  const btEtRegex = /BT\s([\s\S]*?)ET/g;
  let match;
  while ((match = btEtRegex.exec(raw)) !== null) {
    const block = match[1];
    // Extract text from Tj, TJ, ', " operators
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      textParts.push(decodePdfString(tjMatch[1]));
    }
    // TJ arrays: [(text) kerning (text) ...]
    const tjArrayRegex = /\[((?:\([^)]*\)|[^[\]])*)\]\s*TJ/g;
    let arrMatch;
    while ((arrMatch = tjArrayRegex.exec(block)) !== null) {
      const innerRegex = /\(([^)]*)\)/g;
      let innerMatch;
      while ((innerMatch = innerRegex.exec(arrMatch[1])) !== null) {
        textParts.push(decodePdfString(innerMatch[1]));
      }
    }
  }

  // Strategy 2: If BT/ET extraction yielded very little, try stream decoding
  if (textParts.join("").trim().length < 50) {
    const streamRegex = /stream\r?\n([\s\S]*?)endstream/g;
    let sMatch;
    while ((sMatch = streamRegex.exec(raw)) !== null) {
      const streamContent = sMatch[1];
      // Try to find readable ASCII text in the stream
      const readable = streamContent.replace(/[^\x20-\x7E\n\r\t]/g, " ");
      const words = readable.match(/[a-zA-Z]{2,}/g);
      if (words && words.length > 3) {
        textParts.push(words.join(" "));
      }
    }
  }

  let result = textParts.join(" ");
  // Clean up
  result = result.replace(/\s+/g, " ").trim();
  return result;
}

function decodePdfString(s: string): string {
  return s
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\");
}

// ─── AI Evaluation ───
async function evaluateWithAI(
  staffText: string,
  studentText: string,
  apiKey: string
) {
  const systemPrompt = `You are ScriptGrade, an expert academic answer evaluator. You compare a student's answer script against a reference (staff) answer key and produce a structured evaluation.

IMPORTANT INSTRUCTIONS:
1. Identify individual questions from both texts. Match them by question number.
2. For each question, evaluate the student's answer against the reference answer using semantic understanding.
3. Assign marks based on conceptual accuracy, keyword coverage, and completeness.
4. Group questions into parts (Part A, Part B, Part C) based on mark weightage patterns you detect.
5. Provide detailed, constructive, student-friendly feedback.

You MUST respond with ONLY a valid JSON object (no markdown, no code fences) matching this exact structure:

{
  "totalMarksObtained": number,
  "maxMarks": number,
  "averageScore": number,
  "maxAverageScore": number,
  "grade": "A+" | "A" | "B" | "C" | "D" | "F",
  "percentage": number,
  "overallFeedback": "string (2-3 sentences summarizing performance)",
  "questionsAttended": number,
  "totalQuestions": number,
  "parts": [
    {
      "name": "Part A",
      "questionsInPaper": number,
      "questionsToAnswer": number,
      "marksPerQuestion": number,
      "totalMarks": number,
      "markSplit": "e.g. 10 × 1 = 10",
      "compulsoryQuestions": [numbers] or omit,
      "questions": [
        {
          "questionNumber": number,
          "marksObtained": number,
          "maxMarks": number,
          "feedback": "short 1-line feedback",
          "detailedFeedback": {
            "overallAssessment": "Excellent" | "Good" | "Average" | "Needs Improvement",
            "strengths": ["what the student did well"],
            "mistakes": ["specific errors or missing points"],
            "suggestions": ["actionable improvement advice"],
            "modelAnswer": "brief ideal answer (optional)",
            "missingKeywords": ["important terms the student missed"]
          }
        }
      ]
    }
  ]
}

Grading scale:
- 90-100%: A+
- 80-89%: A
- 70-79%: B
- 60-69%: C
- 50-59%: D
- Below 50%: F

Be encouraging but honest. Identify strengths before pointing out mistakes.`;

  const userPrompt = `## REFERENCE ANSWER KEY (Staff):
${staffText.substring(0, 15000)}

## STUDENT ANSWER SCRIPT:
${studentText.substring(0, 15000)}

Evaluate the student's answers against the reference and return the structured JSON evaluation.`;

  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw Object.assign(new Error("Rate limit exceeded. Please try again in a moment."), { status: 429 });
    }
    if (response.status === 402) {
      throw Object.assign(new Error("AI credits exhausted. Please add funds in Settings > Workspace > Usage."), { status: 402 });
    }
    const errText = await response.text();
    console.error("AI gateway error:", response.status, errText);
    throw new Error("AI evaluation failed. Please try again.");
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI returned empty response");
  }

  // Parse JSON from AI response (strip markdown fences if present)
  const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  
  try {
    const result = JSON.parse(cleaned);
    return result;
  } catch (parseErr) {
    console.error("Failed to parse AI response:", cleaned.substring(0, 500));
    throw new Error("AI returned invalid evaluation format. Please try again.");
  }
}
