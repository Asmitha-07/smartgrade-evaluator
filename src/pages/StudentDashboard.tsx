import { useState } from "react";
import { toast } from "sonner";
import {
  GraduationCap, LogOut, Upload, Brain, Sparkles, Network, Monitor,
  FileCode2, Settings, Calculator, Database, Cpu, Code2, BarChart3, Leaf,
  Binary, Globe, Lock, LineChart, Smartphone, Cloud, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  SEMESTERS, SEMESTER_SUBJECTS, type Semester, type SubjectInfo,
} from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import ResultsDashboard, { type EvaluationResult } from "@/components/ResultsDashboard";
import LoadingIndicator from "@/components/LoadingIndicator";

const ICON_MAP: Record<string, React.ReactNode> = {
  Brain: <Brain className="h-6 w-6" />,
  Sparkles: <Sparkles className="h-6 w-6" />,
  Network: <Network className="h-6 w-6" />,
  Monitor: <Monitor className="h-6 w-6" />,
  FileCode2: <FileCode2 className="h-6 w-6" />,
  Settings: <Settings className="h-6 w-6" />,
  Calculator: <Calculator className="h-6 w-6" />,
  Database: <Database className="h-6 w-6" />,
  Cpu: <Cpu className="h-6 w-6" />,
  Code2: <Code2 className="h-6 w-6" />,
  BarChart3: <BarChart3 className="h-6 w-6" />,
  Leaf: <Leaf className="h-6 w-6" />,
  Binary: <Binary className="h-6 w-6" />,
  Globe: <Globe className="h-6 w-6" />,
  Lock: <Lock className="h-6 w-6" />,
  LineChart: <LineChart className="h-6 w-6" />,
  Smartphone: <Smartphone className="h-6 w-6" />,
  Cloud: <Cloud className="h-6 w-6" />,
};

const MOCK_RESULT: EvaluationResult = {
  totalMarksObtained: 26, maxMarks: 50, averageScore: 1.4, maxAverageScore: 3.2,
  grade: "D", percentage: 52,
  overallFeedback: "Needs significant revision. Review the concepts thoroughly.",
  questionsAttended: 14, totalQuestions: 18,
  parts: [
    { name: "Part A", questionsInPaper: 10, questionsToAnswer: 10, marksPerQuestion: 1, totalMarks: 10, markSplit: "10 × 1 = 10",
      questions: [
        { questionNumber: 1, marksObtained: 1, maxMarks: 1, feedback: "Correct." },
        { questionNumber: 2, marksObtained: 0, maxMarks: 1, feedback: "Incorrect." },
        { questionNumber: 3, marksObtained: 1, maxMarks: 1, feedback: "Correct." },
        { questionNumber: 4, marksObtained: 1, maxMarks: 1, feedback: "Correct." },
        { questionNumber: 5, marksObtained: 0, maxMarks: 1, feedback: "Incorrect." },
        { questionNumber: 6, marksObtained: 1, maxMarks: 1, feedback: "Correct." },
        { questionNumber: 7, marksObtained: 0, maxMarks: 1, feedback: "Incorrect." },
        { questionNumber: 8, marksObtained: 1, maxMarks: 1, feedback: "Correct." },
        { questionNumber: 9, marksObtained: 1, maxMarks: 1, feedback: "Correct." },
        { questionNumber: 10, marksObtained: 0, maxMarks: 1, feedback: "Incorrect." },
      ],
    },
    { name: "Part B", questionsInPaper: 5, questionsToAnswer: 5, marksPerQuestion: 2, totalMarks: 10, markSplit: "5 × 2 = 10",
      questions: [
        { questionNumber: 11, marksObtained: 2, maxMarks: 2, feedback: "Correct." },
        { questionNumber: 12, marksObtained: 1, maxMarks: 2, feedback: "Partially correct." },
        { questionNumber: 13, marksObtained: 2, maxMarks: 2, feedback: "Correct." },
        { questionNumber: 14, marksObtained: 0, maxMarks: 2, feedback: "Incorrect." },
        { questionNumber: 15, marksObtained: 2, maxMarks: 2, feedback: "Correct." },
      ],
    },
    { name: "Part C", questionsInPaper: 4, questionsToAnswer: 3, marksPerQuestion: 10, totalMarks: 30, markSplit: "3 × 10 = 30", compulsoryQuestions: [16],
      questions: [
        { questionNumber: 16, marksObtained: 5, maxMarks: 10, feedback: "Partially correct. (Compulsory)" },
        { questionNumber: 17, marksObtained: 10, maxMarks: 10, feedback: "Excellent." },
        { questionNumber: 18, marksObtained: 8, maxMarks: 10, feedback: "Mostly correct." },
      ],
    },
  ],
};

const StudentDashboard = () => {
  const { userName, logout, login } = useAuth();
  const navigate = useNavigate();
  const [semester, setSemester] = useState<Semester>("Semester 6");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [answerScript, setAnswerScript] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const handleLogout = () => { logout(); navigate("/auth"); };

  const handleSwitchToStaff = () => {
    login("staff", userName);
    navigate("/staff");
  };

  const handleSelectSubject = (subject: SubjectInfo) => {
    setSelectedSubject(subject.name);
    setResult(null);
    setAnswerScript(null);
  };

  const handleEvaluate = async () => {
    if (!answerScript || !selectedSubject) {
      toast.error("Please upload your answer script.");
      return;
    }
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 2500));
    setResult(MOCK_RESULT);
    setLoading(false);
  };

  const subjects = SEMESTER_SUBJECTS[semester];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight text-foreground">ScriptGrade</span>
            <Badge variant="secondary" className="ml-1 text-xs font-semibold">Student</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:block">{userName}</span>
            <Button variant="outline" size="sm" onClick={handleSwitchToStaff} className="gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5" /> Staff
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto max-w-5xl px-6 py-10">
        {/* Title */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Student Dashboard</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Select your semester and subject, upload your answer script, and get instant AI evaluation.
          </p>
        </div>

        {/* Semester Tabs */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {SEMESTERS.map((sem) => (
            <button
              key={sem}
              onClick={() => { setSemester(sem); setSelectedSubject(null); setResult(null); setAnswerScript(null); }}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                semester === sem
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {sem}
            </button>
          ))}
        </div>

        {/* Subject Grid */}
        {!selectedSubject && !loading && !result && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <button
                key={subject.name}
                onClick={() => handleSelectSubject(subject)}
                className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  {ICON_MAP[subject.icon] || <FileCode2 className="h-6 w-6" />}
                </div>
                <p className="text-sm font-semibold text-foreground">{subject.name}</p>
              </button>
            ))}
          </div>
        )}

        {/* Upload Section */}
        {selectedSubject && !result && !loading && (
          <div className="mx-auto max-w-xl space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">{selectedSubject}</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedSubject(null)} className="text-xs text-muted-foreground">
                ← Back to subjects
              </Button>
            </div>
            <label
              htmlFor="answer-script"
              className="group flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-card px-6 py-14 transition-all hover:border-primary/40 hover:bg-primary/5"
            >
              <Upload className="h-10 w-10 text-muted-foreground transition-colors group-hover:text-primary" />
              <span className="text-sm font-semibold text-foreground">Upload Answer Script</span>
              {answerScript ? (
                <span className="max-w-full truncate text-xs font-medium text-primary">{answerScript.name}</span>
              ) : (
                <span className="text-xs text-muted-foreground">Click to browse · PDF only</span>
              )}
              <input
                id="answer-script"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) setAnswerScript(f); }}
              />
            </label>
            <Button onClick={handleEvaluate} disabled={!answerScript} size="lg" className="w-full font-semibold">
              Start Evaluation
            </Button>
          </div>
        )}

        {/* Loading */}
        {loading && <section className="mt-12"><LoadingIndicator /></section>}

        {/* Results */}
        {result && !loading && (
          <section className="mx-auto mt-8 max-w-3xl">
            <ResultsDashboard result={result} />
            <div className="mt-6">
              <Button variant="outline" onClick={() => { setResult(null); setAnswerScript(null); setSelectedSubject(null); }} className="w-full">
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
