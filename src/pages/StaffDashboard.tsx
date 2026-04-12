import { useState } from "react";
import { toast } from "sonner";
import {
  BookOpen, FileText, LogOut, CheckCircle2, Users, GraduationCap,
  Brain, Network, Monitor, FileCode2, Settings, Calculator, Database,
  Cpu, Code2, BarChart3, Leaf, Binary,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  SEMESTERS, SEMESTER_SUBJECTS, type Semester, type SubjectInfo,
} from "@/lib/auth";
import { useNavigate } from "react-router-dom";

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

const StaffDashboard = () => {
  const { userName, logout, login } = useAuth();
  const navigate = useNavigate();
  const [semester, setSemester] = useState<Semester>("Semester 1");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [questionPaper, setQuestionPaper] = useState<File | null>(null);
  const [answerKey, setAnswerKey] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleLogout = () => { logout(); navigate("/auth"); };
  const handleSwitchToStudent = () => { login("student", userName); navigate("/student"); };

  const handleUpload = async () => {
    if (!questionPaper || !answerKey || !selectedSubject) {
      toast.error("Please select a subject and upload both files.");
      return;
    }
    setUploading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setUploading(false);
    setUploaded(true);
    toast.success(`Files uploaded for ${selectedSubject}!`);
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
              Staff
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="mr-1 hidden text-sm text-muted-foreground sm:inline">{userName}</span>
            <Button variant="outline" size="sm" onClick={handleSwitchToStudent} className="h-8 gap-1.5 rounded-lg text-xs font-medium">
              <Users className="h-3.5 w-3.5" /> Student
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
            Staff Dashboard
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Select a semester and subject, then upload the question paper and answer key.
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
                  setUploaded(false);
                  setQuestionPaper(null);
                  setAnswerKey(null);
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
        {!selectedSubject && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <button
                key={subject.name}
                onClick={() => { setSelectedSubject(subject.name); setUploaded(false); setQuestionPaper(null); setAnswerKey(null); }}
                className="group flex min-h-[100px] items-center gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {ICON_MAP[subject.icon] || <FileText className="h-5 w-5" />}
                </div>
                <span className="text-sm font-semibold leading-snug text-foreground">
                  {subject.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* ── Upload Section ── */}
        {selectedSubject && (
          <div className="mx-auto max-w-lg space-y-5 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UploadBox label="Question Paper" file={questionPaper} onFileSelect={setQuestionPaper} icon={<FileText className="h-8 w-8" />} />
              <UploadBox label="Answer Key" file={answerKey} onFileSelect={setAnswerKey} icon={<BookOpen className="h-8 w-8" />} />
            </div>
            {uploaded ? (
              <div className="flex items-center gap-3 rounded-xl border-2 border-border bg-accent p-5 text-foreground">
                <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-semibold">Files uploaded successfully!</p>
                  <p className="text-sm text-muted-foreground">Students can now submit answer scripts for {selectedSubject}.</p>
                </div>
              </div>
            ) : (
              <Button onClick={handleUpload} disabled={uploading || !questionPaper || !answerKey} size="lg" className="w-full font-semibold">
                {uploading ? "Uploading…" : "Upload Files"}
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

function UploadBox({ label, file, onFileSelect, icon }: { label: string; file: File | null; onFileSelect: (f: File) => void; icon: React.ReactNode }) {
  const inputId = `upload-${label.replace(/\s/g, "-")}`;
  return (
    <label htmlFor={inputId} className="group flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-card px-6 py-10 transition-all hover:border-primary/40 hover:bg-primary/5">
      <div className="text-muted-foreground transition-colors group-hover:text-primary">{icon}</div>
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {file ? <span className="text-xs text-primary font-medium truncate max-w-full">{file.name}</span> : <span className="text-xs text-muted-foreground">Click to browse · PDF only</span>}
      <input id={inputId} type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileSelect(f); }} />
    </label>
  );
}

export default StaffDashboard;
