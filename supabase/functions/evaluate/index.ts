const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const staffFile = formData.get("staffAnswer") as File | null;
    const studentFile = formData.get("studentAnswer") as File | null;
    const subject = formData.get("subject") as string | null;
    const semester = formData.get("semester") as string | null;

    if (!staffFile || !studentFile) {
      return new Response(
        JSON.stringify({ error: "Both staffAnswer and studentAnswer PDF files are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract text from PDFs independently - no caching
    console.log(`[evaluate] Processing: subject=${subject}, semester=${semester}`);
    console.log(`[evaluate] Staff file: ${staffFile.name} (${staffFile.size} bytes)`);
    console.log(`[evaluate] Student file: ${studentFile.name} (${studentFile.size} bytes)`);

    const staffText = await extractTextFromPdf(staffFile);
    const studentText = await extractTextFromPdf(studentFile);

    console.log(`[evaluate] Staff text length: ${staffText.length} chars`);
    console.log(`[evaluate] Student text length: ${studentText.length} chars`);
    console.log(`[evaluate] Staff text preview: ${staffText.substring(0, 200)}`);
    console.log(`[evaluate] Student text preview: ${studentText.substring(0, 200)}`);

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

    // Call AI for evaluation - fresh call every time, no caching
    const evaluationResult = await evaluateWithAI(staffText, studentText, LOVABLE_API_KEY, subject || "Unknown Subject");

    console.log(`[evaluate] Result: marks=${evaluationResult.totalMarksObtained}/${evaluationResult.maxMarks}, grade=${evaluationResult.grade}`);

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
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  return extractTextFromPdfBytes(bytes);
}

function extractTextFromPdfBytes(bytes: Uint8Array): string {
  const raw = new TextDecoder("latin1").decode(bytes);
  const textParts: string[] = [];

  // Strategy 1: BT...ET blocks
  const btEtRegex = /BT\s([\s\S]*?)ET/g;
  let match;
  while ((match = btEtRegex.exec(raw)) !== null) {
    const block = match[1];
    // Tj operator
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      textParts.push(decodePdfString(tjMatch[1]));
    }
    // TJ arrays
    const tjArrayRegex = /\[((?:\([^)]*\)|[^[\]])*)\]\s*TJ/g;
    let arrMatch;
    while ((arrMatch = tjArrayRegex.exec(block)) !== null) {
      const innerRegex = /\(([^)]*)\)/g;
      let innerMatch;
      while ((innerMatch = innerRegex.exec(arrMatch[1])) !== null) {
        textParts.push(decodePdfString(innerMatch[1]));
      }
    }
    // ' and " operators (text showing with line advance)
    const quoteRegex = /\(([^)]*)\)\s*['"]/g;
    let qMatch;
    while ((qMatch = quoteRegex.exec(block)) !== null) {
      textParts.push(decodePdfString(qMatch[1]));
    }
  }

  // Strategy 2: stream content fallback
  if (textParts.join("").trim().length < 50) {
    const streamRegex = /stream\r?\n([\s\S]*?)endstream/g;
    let sMatch;
    while ((sMatch = streamRegex.exec(raw)) !== null) {
      const streamContent = sMatch[1];
      const readable = streamContent.replace(/[^\x20-\x7E\n\r\t]/g, " ");
      const words = readable.match(/[a-zA-Z]{2,}/g);
      if (words && words.length > 3) {
        textParts.push(words.join(" "));
      }
    }
  }

  let result = textParts.join(" ");
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
  apiKey: string,
  subject: string
) {
  const systemPrompt = `You are ScriptGrade, an expert academic answer evaluator for the subject "${subject}". You compare a student's answer script against a reference (staff) answer key and produce a structured evaluation.

CRITICAL INSTRUCTIONS — READ CAREFULLY:
1. You MUST analyze the ACTUAL TEXT provided below. Do NOT generate generic or placeholder results.
2. Identify individual questions from BOTH texts. Match them by question number (Q1, Q2, Q3, etc., or numbered items).
3. For EACH question, compare the student's specific answer against the staff's specific reference answer.
4. Assign marks based on:
   - Conceptual accuracy (does the student's answer convey the correct meaning?)
   - Keyword coverage (are important technical terms present?)
   - Completeness (does the answer cover all required points?)
5. Group questions into parts based on mark weightage:
   - Part A: Short/objective questions (typically 1 mark each)
   - Part B: Medium questions (typically 2 marks each)
   - Part C: Long/essay questions (typically 10 marks each)
6. If you cannot clearly identify parts, group all questions under "Part A".

FEEDBACK REQUIREMENTS (VERY IMPORTANT):
For EACH question provide:
- overallAssessment: "Excellent" (80-100%) | "Good" (60-79%) | "Average" (40-59%) | "Needs Improvement" (<40%)
- strengths: What the student got right (be specific to their actual answer)
- mistakes: What they got wrong or missed (reference specific content from the staff answer)
- suggestions: Actionable improvement advice
- modelAnswer: A brief 2-3 line correct answer based on the staff answer key
- missingKeywords: Important terms from the staff answer that the student missed

KEYWORD DETECTION:
- Extract key technical terms from the staff answer for each question
- Check which of these appear in the student's answer
- List missing ones in missingKeywords

You MUST respond with ONLY a valid JSON object (no markdown, no code fences) matching this exact structure:

{
  "totalMarksObtained": number,
  "maxMarks": number,
  "averageScore": number,
  "maxAverageScore": number,
  "grade": "A+" | "A" | "B" | "C" | "D" | "F",
  "percentage": number,
  "overallFeedback": "string (2-3 sentences summarizing performance with specific observations)",
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
          "feedback": "short 1-line feedback specific to this answer",
          "detailedFeedback": {
            "overallAssessment": "Excellent" | "Good" | "Average" | "Needs Improvement",
            "strengths": ["specific things the student did well"],
            "mistakes": ["specific errors or missing points"],
            "suggestions": ["actionable improvement advice"],
            "modelAnswer": "brief ideal answer from the staff key",
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

IMPORTANT: Different PDFs MUST produce different results. Base your evaluation ENTIRELY on the actual text content provided.`;

  const userPrompt = `## REFERENCE ANSWER KEY (Staff) for ${subject}:
---
${staffText.substring(0, 15000)}
---

## STUDENT ANSWER SCRIPT:
---
${studentText.substring(0, 15000)}
---

Analyze the above texts carefully. Identify each question, compare the student's answer to the reference, and return the structured JSON evaluation. Every score and feedback item must reflect the ACTUAL content of these specific documents.`;

  console.log(`[evaluate] Calling AI with staff text (${staffText.length} chars) and student text (${studentText.length} chars)`);

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

  const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  try {
    const result = JSON.parse(cleaned);
    console.log(`[evaluate] Parsed result: ${result.parts?.length || 0} parts, ${result.totalMarksObtained}/${result.maxMarks}`);
    return result;
  } catch (parseErr) {
    console.error("Failed to parse AI response:", cleaned.substring(0, 500));
    throw new Error("AI returned invalid evaluation format. Please try again.");
  }
}
