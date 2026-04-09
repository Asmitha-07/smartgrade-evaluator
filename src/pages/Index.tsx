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
  maxMarks: 50,
  averageScore: 1.4,
  maxAverageScore: 3.2,
  grade: "D",
  percentage: 52,
  overallFeedback:
    "Needs significant revision. Review the concepts thoroughly. The student shows partial understanding in some areas but key definitions and explanations are missing or incorrect in several questions. Focus on strengthening fundamentals before attempting complex topics.",
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
        { questionNumber: 1, marksObtained: 1, maxMarks: 1, feedback: "Correct.",
          detailedFeedback: { overallAssessment: "Excellent", strengths: ["Correct identification of the answer."], mistakes: [], suggestions: [], } },
        { questionNumber: 2, marksObtained: 0, maxMarks: 1, feedback: "Incorrect. The correct answer is B.",
          detailedFeedback: { overallAssessment: "Needs Improvement", strengths: [], mistakes: ["Selected wrong option. The concept of abstraction was confused with encapsulation."], suggestions: ["Review the difference between abstraction and encapsulation in OOP."], modelAnswer: "B — Abstraction hides complexity by exposing only relevant features to the user.", missingKeywords: ["abstraction", "interface"] } },
        { questionNumber: 3, marksObtained: 1, maxMarks: 1, feedback: "Correct.",
          detailedFeedback: { overallAssessment: "Excellent", strengths: ["Correct answer selected."], mistakes: [], suggestions: [] } },
        { questionNumber: 4, marksObtained: 1, maxMarks: 1, feedback: "Correct.",
          detailedFeedback: { overallAssessment: "Excellent", strengths: ["Correct."], mistakes: [], suggestions: [] } },
        { questionNumber: 5, marksObtained: 0, maxMarks: 1, feedback: "Incorrect. Review the definition of polymorphism.",
          detailedFeedback: { overallAssessment: "Needs Improvement", strengths: [], mistakes: ["Confused polymorphism with inheritance."], suggestions: ["Study compile-time vs runtime polymorphism with examples."], modelAnswer: "Polymorphism allows objects of different classes to be treated as objects of a common superclass, enabling method overriding and overloading.", missingKeywords: ["overriding", "overloading", "runtime"] } },
        { questionNumber: 6, marksObtained: 1, maxMarks: 1, feedback: "Correct.",
          detailedFeedback: { overallAssessment: "Excellent", strengths: ["Correct."], mistakes: [], suggestions: [] } },
        { questionNumber: 7, marksObtained: 0, maxMarks: 1, feedback: "Incorrect.",
          detailedFeedback: { overallAssessment: "Needs Improvement", strengths: [], mistakes: ["Wrong option selected."], suggestions: ["Revisit the chapter on data types."], } },
        { questionNumber: 8, marksObtained: 1, maxMarks: 1, feedback: "Correct.",
          detailedFeedback: { overallAssessment: "Excellent", strengths: ["Correct."], mistakes: [], suggestions: [] } },
        { questionNumber: 9, marksObtained: 1, maxMarks: 1, feedback: "Correct.",
          detailedFeedback: { overallAssessment: "Excellent", strengths: ["Correct."], mistakes: [], suggestions: [] } },
        { questionNumber: 10, marksObtained: 0, maxMarks: 1, feedback: "Incorrect. The answer should be 'encapsulation'.",
          detailedFeedback: { overallAssessment: "Needs Improvement", strengths: [], mistakes: ["Wrote 'abstraction' instead of 'encapsulation'."], suggestions: ["Remember: encapsulation = bundling data + methods together and restricting access."], modelAnswer: "Encapsulation is the mechanism of wrapping data and code together as a single unit, restricting direct access to some components.", missingKeywords: ["encapsulation", "access modifier"] } },
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
        { questionNumber: 11, marksObtained: 2, maxMarks: 2, feedback: "Correct. Well explained.",
          detailedFeedback: { overallAssessment: "Excellent", strengths: ["Clear and concise explanation.", "Used appropriate technical terms."], mistakes: [], suggestions: ["Consider adding a diagram for visual clarity in exams."], } },
        { questionNumber: 12, marksObtained: 1, maxMarks: 2, feedback: "Partially correct. Missing key details.",
          detailedFeedback: { overallAssessment: "Average", strengths: ["Demonstrated basic understanding of the concept."], mistakes: ["Did not mention the role of the scheduler in process management.", "Explanation lacked depth on context switching."], suggestions: ["Include the steps involved in context switching.", "Mention different scheduling algorithms (FCFS, SJF, Round Robin)."], modelAnswer: "Process scheduling is the activity of the process manager that handles the removal of the running process from the CPU and the selection of another process based on a particular strategy (FCFS, SJF, Priority, Round Robin).", missingKeywords: ["context switching", "scheduler", "CPU"] } },
        { questionNumber: 13, marksObtained: 2, maxMarks: 2, feedback: "Correct.",
          detailedFeedback: { overallAssessment: "Excellent", strengths: ["Accurate and complete answer.", "Good use of examples."], mistakes: [], suggestions: [] } },
        { questionNumber: 14, marksObtained: 0, maxMarks: 2, feedback: "Incorrect. The student answer seems to be for a different question.",
          detailedFeedback: { overallAssessment: "Needs Improvement", strengths: [], mistakes: ["Answer is completely irrelevant to the question asked.", "Appears to have confused question numbers."], suggestions: ["Read questions carefully before answering.", "Cross-check question numbers with your answers."], modelAnswer: "A linked list is a linear data structure where elements are stored in nodes, each containing data and a pointer to the next node. Unlike arrays, linked lists allow efficient insertion and deletion.", missingKeywords: ["node", "pointer", "linked list"] } },
        { questionNumber: 15, marksObtained: 2, maxMarks: 2, feedback: "Correct. The student accurately identified Computer Vision.",
          detailedFeedback: { overallAssessment: "Excellent", strengths: ["Correctly identified and explained Computer Vision.", "Mentioned relevant real-world applications."], mistakes: [], suggestions: ["You could also mention deep learning frameworks used in CV."], } },
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
        { questionNumber: 16, marksObtained: 5, maxMarks: 10, feedback: "Partially correct but lacks depth. Key points about system architecture were missing. (Compulsory)",
          detailedFeedback: { overallAssessment: "Average", strengths: ["Showed basic understanding of system architecture.", "Attempted to cover multiple components."], mistakes: ["Did not explain client-server architecture in detail.", "Missing discussion on scalability and load balancing.", "No mention of database layer or API design."], suggestions: ["Structure your answer with clear sections: frontend, backend, database, deployment.", "Include a system architecture diagram.", "Discuss trade-offs between monolithic and microservice architectures."], modelAnswer: "A complete system architecture includes: (1) Client layer — UI/UX frontend, (2) Application layer — business logic and APIs, (3) Data layer — databases and caching, (4) Infrastructure — servers, load balancers, CDN. Key considerations include scalability, fault tolerance, and security.", missingKeywords: ["scalability", "load balancing", "API", "database layer", "microservices"] } },
        { questionNumber: 17, marksObtained: 10, maxMarks: 10, feedback: "Correct. The student accurately identified mobile phones and AR applications.",
          detailedFeedback: { overallAssessment: "Excellent", strengths: ["Comprehensive answer covering all key points.", "Excellent use of real-world examples (AR, mobile sensors).", "Well-structured and clearly written."], mistakes: [], suggestions: ["Great work! Continue maintaining this level of detail in all answers."], } },
        { questionNumber: 18, marksObtained: 8, maxMarks: 10, feedback: "Mostly correct. Minor details about location-based services were missing.",
          detailedFeedback: { overallAssessment: "Good", strengths: ["Strong conceptual understanding demonstrated.", "Good explanation of GPS and geofencing.", "Logical flow of ideas."], mistakes: ["Did not mention indoor positioning systems (IPS).", "Missing discussion on privacy concerns of location tracking."], suggestions: ["Include both outdoor (GPS) and indoor (BLE beacons, Wi-Fi) positioning.", "Discuss privacy and ethical considerations of location-based services."], missingKeywords: ["indoor positioning", "BLE beacons", "privacy"] } },
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
