import { useState } from "react";
import { toast } from "sonner";
import {
  GraduationCap, LogOut, Upload, Brain, Network, Monitor,
  FileCode2, Settings, Calculator, Database, Cpu, Code2, BarChart3, Leaf,
  Binary, Users,
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
import FileUploadCard from "@/components/FileUploadCard";

const ICON_MAP: Record<string, React.ReactNode> = {
  Brain: <Brain className="h-5 w-5" />,
  Network: <Network className="h-5 w-5" />,
  Monitor: <Monitor className="h-5 w-5" />,
  FileCode2: <FileCode2 className="h-5 w-5" />,
  Settings: <Settings className="h-5 w-5" />,
  Calculator: <Calculator className="h-5 w-5" />,
  Database: <Database className="h-5 w-5" />,
  Cpu: <Cpu className="h-5 w-5" />,
  Code2: <Code2 className="h-5 w-5" />,
  BarChart3: <BarChart3 className="h-5 w-5" />,
  Leaf: <Leaf className="h-5 w-5" />,
  Binary: <Binary className="h-5 w-5" />,
};

const StudentDashboard = () => {
  const { userName, logout, login } = useAuth();
  const navigate = useNavigate();
  const [semester, setSemester] = useState<Semester>("Semester 1");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [staffAnswer, setStaffAnswer] = useState<File | null>(null);
  const [answerScript, setAnswerScript] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const handleLogout = () => { logout(); navigate("/auth"); };
  const handleSwitchToStaff = () => { login("staff", userName); navigate("/staff"); };

  const handleSelectSubject = (subject: SubjectInfo) => {
    setSelectedSubject(subject.name);
    setResult(null);
    setStaffAnswer(null);
    setAnswerScript(null);
  };

  const handleEvaluate = async () => {
    if (!answerScript || !selectedSubject) {
      toast.error("Please upload your answer script.");
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("staffAnswer", staffAnswer);
      formData.append("studentAnswer", answerScript);
      formData.append("subject", selectedSubject);
      formData.append("semester", semester);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/evaluate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Evaluation failed" }));
        throw new Error(err.error || "Evaluation failed");
      }

      const data: EvaluationResult = await res.json();
      setResult(data);
      toast.success("Evaluation complete!");
    } catch (err: any) {
      toast.error(err?.message || "Evaluation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const subjects = SEMESTER_SUBJECTS[semester];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="text-base font-bold tracking-tight text-foreground">ScriptGrade</span>
            <Badge variant="secondary" className="ml-1 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
              Student
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="mr-1 hidden text-sm text-muted-foreground sm:inline">{userName}</span>
            <Button variant="outline" size="sm" onClick={handleSwitchToStaff} className="h-8 gap-1.5 rounded-lg text-xs font-medium">
              <Users className="h-3.5 w-3.5" /> Staff
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* ── Title ── */}
        <section className="mb-10 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Student Dashboard
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Select your semester and subject, upload both the staff answer key and your answer script, and get instant AI evaluation.
          </p>
        </section>

        {/* ── Semester Tabs ── */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex gap-1 rounded-xl bg-secondary p-1">
            {SEMESTERS.map((sem) => (
              <button
                key={sem}
                onClick={() => {
                  setSemester(sem);
                  setSelectedSubject(null);
                  setResult(null);
                  setStaffAnswer(null);
                  setAnswerScript(null);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all sm:px-6 ${
                  semester === sem
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {sem}
              </button>
            ))}
          </div>
        </div>

        {/* ── Subject Grid ── */}
        {!selectedSubject && !loading && !result && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <button
                key={subject.name}
                onClick={() => handleSelectSubject(subject)}
                className="group flex min-h-[100px] items-center gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {ICON_MAP[subject.icon] || <FileCode2 className="h-5 w-5" />}
                </div>
                <span className="text-sm font-semibold leading-snug text-foreground">
                  {subject.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* ── Upload Section ── */}
        {selectedSubject && !result && !loading && (
          <div className="mx-auto max-w-2xl space-y-5 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">{selectedSubject}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSubject(null)}
                className="text-xs text-muted-foreground"
              >
                ← Back
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FileUploadCard
                label="Staff (Reference) Answer Key"
                file={staffAnswer}
                onFileSelect={setStaffAnswer}
              />
              <FileUploadCard
                label="Your Answer Script"
                file={answerScript}
                onFileSelect={setAnswerScript}
              />
            </div>

            <Button
              onClick={handleEvaluate}
              disabled={!staffAnswer || !answerScript}
              size="lg"
              className="w-full font-semibold"
            >
              Start Evaluation
            </Button>
          </div>
        )}

        {loading && <section className="mt-12"><LoadingIndicator /></section>}

        {result && !loading && (
          <section className="mx-auto mt-8 max-w-3xl">
            <ResultsDashboard result={result} />
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => { setResult(null); setStaffAnswer(null); setAnswerScript(null); setSelectedSubject(null); }}
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
