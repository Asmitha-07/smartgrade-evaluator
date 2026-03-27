import { useState } from "react";
import { toast } from "sonner";
import { BookOpen, Upload, FileText, LogOut, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { SUBJECTS, type Subject } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [questionPaper, setQuestionPaper] = useState<File | null>(null);
  const [answerKey, setAnswerKey] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleUpload = async () => {
    if (!questionPaper || !answerKey || !selectedSubject) {
      toast.error("Please select a subject and upload both files.");
      return;
    }
    setUploading(true);
    // Mock upload delay
    await new Promise((r) => setTimeout(r, 1500));
    setUploading(false);
    setUploaded(true);
    toast.success(`Files uploaded for ${selectedSubject}!`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground">SmartGrade</span>
            <span className="ml-2 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
              Staff
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
          <h1 className="text-3xl font-bold text-foreground">Staff Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Select a subject, then upload the question paper and answer key.
          </p>
        </div>

        {/* Subject Selection */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-foreground mb-3">Select Subject</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SUBJECTS.map((subject) => (
              <button
                key={subject}
                onClick={() => { setSelectedSubject(subject); setUploaded(false); }}
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

        {selectedSubject && (
          <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <h2 className="text-sm font-semibold text-foreground">
              Upload Files — {selectedSubject}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Question Paper */}
              <UploadBox
                label="Question Paper"
                file={questionPaper}
                onFileSelect={setQuestionPaper}
                icon={<FileText className="h-8 w-8" />}
              />
              {/* Answer Key */}
              <UploadBox
                label="Answer Key"
                file={answerKey}
                onFileSelect={setAnswerKey}
                icon={<BookOpen className="h-8 w-8" />}
              />
            </div>

            {uploaded ? (
              <div className="flex items-center gap-3 rounded-xl border-2 border-border bg-accent p-5 text-foreground">
                <CheckCircle2 className="h-6 w-6 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Files uploaded successfully!</p>
                  <p className="text-sm opacity-80">Students can now submit answer scripts for {selectedSubject}.</p>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleUpload}
                disabled={uploading || !questionPaper || !answerKey}
                size="lg"
                className="w-full font-semibold"
              >
                {uploading ? "Uploading…" : "Upload Files"}
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

function UploadBox({
  label,
  file,
  onFileSelect,
  icon,
}: {
  label: string;
  file: File | null;
  onFileSelect: (f: File) => void;
  icon: React.ReactNode;
}) {
  const inputId = `upload-${label.replace(/\s/g, "-")}`;
  return (
    <label
      htmlFor={inputId}
      className="group flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-card px-6 py-10 transition-all hover:border-primary/40 hover:bg-primary/5"
    >
      <div className="text-muted-foreground transition-colors group-hover:text-primary">
        {icon}
      </div>
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {file ? (
        <span className="text-xs text-primary font-medium truncate max-w-full">{file.name}</span>
      ) : (
        <span className="text-xs text-muted-foreground">Click to browse · PDF only</span>
      )}
      <input
        id={inputId}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileSelect(f);
        }}
      />
    </label>
  );
}

export default StaffDashboard;
