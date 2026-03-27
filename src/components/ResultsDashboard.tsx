import { BarChart3, TrendingUp, Award, Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateReport } from "@/lib/generateReport";

/* ─── Types ─── */
export interface QuestionResult {
  questionNumber: number;
  marksObtained: number;
  maxMarks: number;
  feedback: string;
}

export interface Part {
  name: string;
  questionsInPaper: number;
  questionsToAnswer: number;
  marksPerQuestion: number;
  totalMarks: number;
  markSplit: string; // e.g. "10 × 1 = 10"
  compulsoryQuestions?: number[]; // e.g. [16]
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
          {/* Total Marks */}
          <div className="text-center">
            <BarChart3 className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-1 text-xs text-muted-foreground">Total Marks</p>
            <p className="mt-1 text-3xl font-bold text-foreground">
              {result.totalMarksObtained}
              <span className="text-base font-normal text-muted-foreground">
                /{result.maxMarks}
              </span>
            </p>
          </div>

          {/* Average Score */}
          <div className="text-center border-x border-border">
            <TrendingUp className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-1 text-xs text-muted-foreground">Average Score</p>
            <p className="mt-1 text-3xl font-bold text-foreground">
              {result.averageScore.toFixed(1)}
              <span className="text-base font-normal text-muted-foreground">
                /{result.maxAverageScore.toFixed(1)}
              </span>
            </p>
          </div>

          {/* Grade */}
          <div className="text-center">
            <Award className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-1 text-xs text-muted-foreground">Grade</p>
            <p className={`mt-1 text-3xl font-bold ${gradeColor(result.grade)}`}>
              {result.grade}
            </p>
          </div>
        </div>
      </div>

      {/* ── Questions attended ── */}
      <div className="rounded-lg border border-border bg-card p-5 flex items-center gap-3">
        <Users className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-foreground">
          Questions Attended:{" "}
          <span className="font-bold">{result.questionsAttended}</span> /{" "}
          {result.totalQuestions}
        </p>
      </div>

      {/* ── OVERALL FEEDBACK ── */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground mb-3">
          Overall Feedback
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {result.overallFeedback}
        </p>
        {/* Progress bar */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-foreground transition-all duration-700"
              style={{ width: `${result.percentage}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-foreground">
            {result.percentage}%
          </span>
        </div>
      </div>

      {/* ── PART-WISE RESULTS ── */}
      {result.parts.map((part) => (
        <div key={part.name} className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-bold text-foreground">{part.name}</h3>
            <span className="text-xs text-muted-foreground font-mono">
              {part.markSplit}
            </span>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-foreground text-background">
                  <th className="px-4 py-2.5 text-left font-semibold">Question</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Marks</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Feedback</th>
                </tr>
              </thead>
              <tbody>
                {part.questions.map((q, i) => (
                  <tr
                    key={q.questionNumber}
                    className="border-b border-border last:border-0 animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <td className="px-4 py-3 font-mono text-foreground">
                      Q{q.questionNumber}
                    </td>
                    <td className="px-4 py-3 font-mono text-foreground">
                      {q.marksObtained} / {q.maxMarks}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {q.feedback}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
