import { useState } from "react";
import { toast } from "sonner";
import { Users, FileText, LogOut, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { SUBJECTS, type Subject } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import ResultsDashboard, { type EvaluationResult } from "@/components/ResultsDashboard";
import LoadingIndicator from "@/components/LoadingIndicator";

const MOCK_RESULT: EvaluationResult = {
  totalMarksObtained: 26,
  maxMarks: 50,
  averageScore: 1.4,
  maxAverageScore: 3.2,
  grade: "D",
  percentage: 52,
  overallFeedback:
    "Needs significant revision. Review the concepts thoroughly. The student shows partial understanding in some areas but key definitions and explanations are missing or incorrect in several questions.",
  questionsAttended: 14,
  totalQuestions: 18,
  parts: [
    {
      name: "Part A",
      questionsInPaper: 10,
      questionsToAnswer: 10,
      marksPerQuestion: 1,
      totalMarks: 10,
      markSplit: "10 × 1 = 10",
      questions: [
        { questionNumber: 1, marksObtained: 1, maxMarks: 1, feedback: "Correct." },
        { questionNumber: 2, marksObtained: 0, maxMarks: 1, feedback: "Incorrect. The correct answer is B." },
        { questionNumber: 3, marksObtained: 1, maxMarks: 1, feedback: "Correct." },
        { questionNumber: 4, marksObtained: 1, maxMarks: 1, feedback: "Correct." },
        { questionNumber: 5, marksObtained: 0, maxMarks: 1, feedback: "Incorrect. Review the definition of polymorphism." },
        { questionNumber: 6, marksObtained: 1, maxMarks: 1, feedback: "Correct." },
        { questionNumber: 7, marksObtained: 0, maxMarks: 1, feedback: "Incorrect." },
        { questionNumber: 8, marksObtained: 1, maxMarks: 1, feedback: "Correct." },
        { questionNumber: 9, marksObtained: 1, maxMarks: 1, feedback: "Correct." },
        { questionNumber: 10, marksObtained: 0, maxMarks: 1, feedback: "Incorrect. The answer should be 'encapsulation'." },
      ],
    },
    {
      name: "Part B",
      questionsInPaper: 5,
      questionsToAnswer: 5,
      marksPerQuestion: 2,
      totalMarks: 10,
      markSplit: "5 × 2 = 10",
      questions: [
        { questionNumber: 11, marksObtained: 2, maxMarks: 2, feedback: "Correct. Well explained." },
        { questionNumber: 12, marksObtained: 1, maxMarks: 2, feedback: "Partially correct. Missing key details." },
        { questionNumber: 13, marksObtained: 2, maxMarks: 2, feedback: "Correct." },
        { questionNumber: 14, marksObtained: 0, maxMarks: 2, feedback: "Incorrect. Wrong question addressed." },
        { questionNumber: 15, marksObtained: 2, maxMarks: 2, feedback: "Correct." },
      ],
    },
    {
      name: "Part C",
      questionsInPaper: 4,
      questionsToAnswer: 3,
      marksPerQuestion: 10,
      totalMarks: 30,
      markSplit: "3 × 10 = 30",
      compulsoryQuestions: [16],
      questions: [
        { questionNumber: 16, marksObtained: 5, maxMarks: 10, feedback: "Partially correct but lacks depth. (Compulsory)" },
        { questionNumber: 17, marksObtained: 10, maxMarks: 10, feedback: "Excellent. Well-structured answer." },
        { questionNumber: 18, marksObtained: 8, maxMarks: 10, feedback: "Mostly correct. Minor details missing." },
      ],
    },
  ],
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [answerScript, setAnswerScript] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleEvaluate = async () => {
    if (!answerScript || !selectedSubject) {
      toast.error("Please select a subject and upload your answer script.");
      return;
    }
    setLoading(true);
    setResult(null);
    // Mock evaluation
    await new Promise((r) => setTimeout(r, 2500));
    setResult(MOCK_RESULT);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground">SmartGrade</span>
            <span className="ml-2 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
              Student
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto max-w-3xl px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Select a subject, upload your answer script, and get instant AI evaluation.
          </p>
        </div>

        {/* Subject Selection */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-foreground mb-3">Select Subject</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SUBJECTS.map((subject) => (
              <button
                key={subject}
                onClick={() => {
                  setSelectedSubject(subject);
                  setResult(null);
                  setAnswerScript(null);
                }}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  selectedSubject === subject
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-muted-foreground/30 hover:bg-accent/50"
                }`}
              >
                <FileText className={`h-5 w-5 mb-2 ${selectedSubject === subject ? "text-primary" : "text-muted-foreground"}`} />
                <p className={`text-sm font-medium ${selectedSubject === subject ? "text-primary" : "text-foreground"}`}>
                  {subject}
                </p>
              </button>
            ))}
          </div>
        </div>

        {selectedSubject && !result && !loading && (
          <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <h2 className="text-sm font-semibold text-foreground">
              Upload Answer Script — {selectedSubject}
            </h2>

            <label
              htmlFor="answer-script"
              className="group flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-card px-6 py-12 transition-all hover:border-primary/40 hover:bg-primary/5"
            >
              <Upload className="h-10 w-10 text-muted-foreground transition-colors group-hover:text-primary" />
              <span className="text-sm font-semibold text-foreground">Answer Script</span>
              {answerScript ? (
                <span className="text-xs text-primary font-medium truncate max-w-full">{answerScript.name}</span>
              ) : (
                <span className="text-xs text-muted-foreground">Click to browse · PDF only</span>
              )}
              <input
                id="answer-script"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setAnswerScript(f);
                }}
              />
            </label>

            <Button
              onClick={handleEvaluate}
              disabled={!answerScript}
              size="lg"
              className="w-full font-semibold"
            >
              Start Evaluation
            </Button>
          </div>
        )}

        {loading && (
          <section className="mt-12">
            <LoadingIndicator />
          </section>
        )}

        {result && !loading && (
          <section className="mt-8">
            <ResultsDashboard result={result} />
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setAnswerScript(null);
                }}
                className="w-full"
              >
                Evaluate Another Script
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
