import { BarChart3, TrendingUp, Award, Users, Download, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Lightbulb, BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateReport } from "@/lib/generateReport";
import { useState } from "react";

/* ─── Types ─── */
export interface DetailedFeedback {
  overallAssessment: string; // "Excellent" | "Good" | "Average" | "Needs Improvement"
  strengths: string[];
  mistakes: string[];
  suggestions: string[];
  modelAnswer?: string;
  missingKeywords?: string[];
}

export interface QuestionResult {
  questionNumber: number;
  marksObtained: number;
  maxMarks: number;
  feedback: string;
  detailedFeedback?: DetailedFeedback;
}

export interface Part {
  name: string;
  questionsInPaper: number;
  questionsToAnswer: number;
  marksPerQuestion: number;
  totalMarks: number;
  markSplit: string;
  compulsoryQuestions?: number[];
  questions: QuestionResult[];
}

export interface EvaluationResult {
  totalMarksObtained: number;
  maxMarks: number;
  averageScore: number;
  maxAverageScore: number;
  grade: string;
  percentage: number;
  overallFeedback: string;
  questionsAttended: number;
  totalQuestions: number;
  parts: Part[];
}

/* ─── Helpers ─── */
const gradeColor = (g: string) => {
  if (g === "A" || g === "A+") return "text-green-700";
  if (g === "B" || g === "B+") return "text-blue-700";
  if (g === "C") return "text-yellow-700";
  return "text-red-700";
};

const assessmentBadge = (a: string) => {
  if (a === "Excellent") return "bg-green-100 text-green-800 border-green-200";
  if (a === "Good") return "bg-blue-100 text-blue-800 border-blue-200";
  if (a === "Average") return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-red-100 text-red-800 border-red-200";
};

/* ─── Expandable Question Card ─── */
const QuestionCard = ({ q, index }: { q: QuestionResult; index: number }) => {
  const [expanded, setExpanded] = useState(false);
  const df = q.detailedFeedback;
  const ratio = q.maxMarks > 0 ? q.marksObtained / q.maxMarks : 0;
  const barColor = ratio >= 0.8 ? "bg-green-500" : ratio >= 0.5 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div
      className="rounded-lg border border-border bg-card overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-semibold text-foreground">Q{q.questionNumber}</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 rounded-full bg-secondary overflow-hidden">
              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${ratio * 100}%` }} />
            </div>
            <span className="text-sm font-mono text-foreground">{q.marksObtained}/{q.maxMarks}</span>
          </div>
          {df && (
            <span className={`text-xs px-2 py-0.5 rounded-full border ${assessmentBadge(df.overallAssessment)}`}>
              {df.overallAssessment}
            </span>
          )}
        </div>
        {df ? (expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />) : null}
      </button>

      {/* Brief feedback always visible */}
      <div className="px-4 pb-3">
        <p className="text-sm text-muted-foreground">{q.feedback}</p>
      </div>

      {/* Expanded detailed feedback */}
      {df && expanded && (
        <div className="border-t border-border px-4 py-4 space-y-4 bg-accent/20">
          {/* Strengths */}
          {df.strengths.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Strengths</h4>
              </div>
              <ul className="space-y-1 pl-6">
                {df.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-foreground list-disc">{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Mistakes */}
          {df.mistakes.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Mistakes / Missing Points</h4>
              </div>
              <ul className="space-y-1 pl-6">
                {df.mistakes.map((m, i) => (
                  <li key={i} className="text-sm text-foreground list-disc">{m}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing keywords */}
          {df.missingKeywords && df.missingKeywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-muted-foreground font-semibold mr-1">Missing keywords:</span>
              {df.missingKeywords.map((kw, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">{kw}</span>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {df.suggestions.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-blue-700">
                <Lightbulb className="h-4 w-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Suggestions</h4>
              </div>
              <ul className="space-y-1 pl-6">
                {df.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-foreground list-disc">{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Model Answer */}
          {df.modelAnswer && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-purple-700">
                <BookOpen className="h-4 w-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Suggested Correct Answer</h4>
              </div>
              <p className="text-sm text-foreground bg-background rounded-md p-3 border border-border leading-relaxed">
                {df.modelAnswer}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Component ─── */
const ResultsDashboard = ({ result }: { result: EvaluationResult }) => {
  const handleDownload = () => generateReport(result);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* ── EVALUATION DASHBOARD header ── */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground mb-6">
          Evaluation Dashboard
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="text-center">
            <BarChart3 className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-1 text-xs text-muted-foreground">Total Marks</p>
            <p className="mt-1 text-3xl font-bold text-foreground">
              {result.totalMarksObtained}
              <span className="text-base font-normal text-muted-foreground">/{result.maxMarks}</span>
            </p>
          </div>
          <div className="text-center border-x border-border">
            <TrendingUp className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-1 text-xs text-muted-foreground">Average Score</p>
            <p className="mt-1 text-3xl font-bold text-foreground">
              {result.averageScore.toFixed(1)}
              <span className="text-base font-normal text-muted-foreground">/{result.maxAverageScore.toFixed(1)}</span>
            </p>
          </div>
          <div className="text-center">
            <Award className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-1 text-xs text-muted-foreground">Grade</p>
            <p className={`mt-1 text-3xl font-bold ${gradeColor(result.grade)}`}>{result.grade}</p>
          </div>
        </div>
      </div>

      {/* ── Questions attended ── */}
      <div className="rounded-lg border border-border bg-card p-5 flex items-center gap-3">
        <Users className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-foreground">
          Questions Attended: <span className="font-bold">{result.questionsAttended}</span> / {result.totalQuestions}
        </p>
      </div>

      {/* ── OVERALL FEEDBACK ── */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground mb-3">Overall Feedback</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{result.overallFeedback}</p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-foreground transition-all duration-700" style={{ width: `${result.percentage}%` }} />
          </div>
          <span className="text-sm font-semibold text-foreground">{result.percentage}%</span>
        </div>
      </div>

      {/* ── PART-WISE RESULTS ── */}
      {result.parts.map((part) => (
        <div key={part.name} className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-bold text-foreground">{part.name}</h3>
            <span className="text-xs text-muted-foreground font-mono">{part.markSplit}</span>
          </div>
          <div className="space-y-2">
            {part.questions.map((q, i) => (
              <QuestionCard key={q.questionNumber} q={q} index={i} />
            ))}
          </div>
        </div>
      ))}

      {/* ── Download button ── */}
      <Button onClick={handleDownload} variant="outline" className="w-full gap-2">
        <Download className="h-4 w-4" />
        Download Detailed Report (PDF)
      </Button>
    </div>
  );
};

export default ResultsDashboard;
