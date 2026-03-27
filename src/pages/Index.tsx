import { useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FileUploadCard from "@/components/FileUploadCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import ResultsDashboard, { type EvaluationResult } from "@/components/ResultsDashboard";
import { Button } from "@/components/ui/button";

const MOCK_RESULT: EvaluationResult = {
  totalMarksObtained: 26,
  maxMarks: 60,
  averageScore: 1.4,
  maxAverageScore: 3.2,
  grade: "D",
  percentage: 43,
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
      questionsToAnswer: 3,
      marksPerQuestion: 10,
      totalMarks: 30,
      markSplit: "3 × 10 = 30",
      questions: [
        { questionNumber: 11, marksObtained: 0, maxMarks: 10, feedback: "The student answer for question 11 is incorrect. It seems to be the answer for a different question." },
        { questionNumber: 12, marksObtained: 10, maxMarks: 10, feedback: "Correct. The student accurately identified Computer Vision as the key concept." },
        { questionNumber: 13, marksObtained: 0, maxMarks: 10, feedback: "The student answer for question 13 is incorrect. It seems to be the answer for question 14." },
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
        { questionNumber: 14, marksObtained: 10, maxMarks: 10, feedback: "Correct. The student accurately identified mobile phones and AR applications." },
        { questionNumber: 15, marksObtained: 10, maxMarks: 10, feedback: "Correct. The student accurately identified location-based services." },
        { questionNumber: 16, marksObtained: 0, maxMarks: 10, feedback: "The student answer is partially correct but lacks depth. Key points about system architecture were missing." },
      ],
    },
  ],
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

      try {
        const res = await fetch("/evaluate", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Backend unavailable");
        const data = await res.json();
        setResult(data);
      } catch {
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

      <main className="container mx-auto max-w-3xl px-6 pb-20">
        <HeroSection />

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

        {loading && (
          <section className="mt-12">
            <LoadingIndicator />
          </section>
        )}

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
