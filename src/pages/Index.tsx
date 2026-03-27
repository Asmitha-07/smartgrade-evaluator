import { useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FileUploadCard from "@/components/FileUploadCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import ResultsDashboard, { type EvaluationResult } from "@/components/ResultsDashboard";
import { Button } from "@/components/ui/button";

const MOCK_RESULT: EvaluationResult = {
  totalMarks: 78,
  averageScore: 7.8,
  questions: [
    { questionNumber: 1, marksAllocated: 9, feedback: "Excellent answer with detailed explanation." },
    { questionNumber: 2, marksAllocated: 7, feedback: "Good answer but lacks clarity in the second part." },
    { questionNumber: 3, marksAllocated: 8, feedback: "Well structured response with relevant examples." },
    { questionNumber: 4, marksAllocated: 6, feedback: "Needs improvement — key concepts were missing." },
    { questionNumber: 5, marksAllocated: 10, feedback: "Perfect answer. All points covered comprehensively." },
    { questionNumber: 6, marksAllocated: 5, feedback: "Partially correct. Revisit the core definition." },
    { questionNumber: 7, marksAllocated: 8, feedback: "Good answer with minor grammatical errors." },
    { questionNumber: 8, marksAllocated: 7, feedback: "Satisfactory. Could include more examples." },
    { questionNumber: 9, marksAllocated: 9, feedback: "Excellent depth of understanding demonstrated." },
    { questionNumber: 10, marksAllocated: 9, feedback: "Very well written and logically organized." },
  ],
  overallFeedback:
    "The student demonstrates a strong understanding of the subject matter overall. Areas for improvement include providing clearer definitions (Q4, Q6) and incorporating more real-world examples. The writing quality is commendable.",
};

const Index = () => {
  const [staffFile, setStaffFile] = useState<File | null>(null);
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const handleEvaluate = async () => {
    if (!staffFile || !studentFile) {
      toast.error("Please upload both the reference and student answer PDFs.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("staffAnswer", staffFile);
      formData.append("studentAnswer", studentFile);

      // Try real backend first; fall back to mock data for demo
      try {
        const res = await fetch("/evaluate", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Backend unavailable");
        const data = await res.json();
        setResult(data);
      } catch {
        // Simulate network delay then use mock
        await new Promise((r) => setTimeout(r, 2000));
        setResult(MOCK_RESULT);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto max-w-2xl px-6 pb-20">
        <HeroSection />

        {/* Upload section */}
        <section className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FileUploadCard
              label="Staff (Reference) Answer"
              file={staffFile}
              onFileSelect={setStaffFile}
            />
            <FileUploadCard
              label="Student Answer"
              file={studentFile}
              onFileSelect={setStudentFile}
            />
          </div>

          <Button
            onClick={handleEvaluate}
            disabled={loading}
            size="lg"
            className="w-full text-sm font-semibold tracking-wide"
          >
            {loading ? "Evaluating…" : "Start Evaluation"}
          </Button>
        </section>

        {/* Loading */}
        {loading && (
          <section className="mt-12">
            <LoadingIndicator />
          </section>
        )}

        {/* Results */}
        {result && !loading && (
          <section className="mt-12">
            <ResultsDashboard result={result} />
          </section>
        )}
      </main>
    </div>
  );
};

export default Index;
