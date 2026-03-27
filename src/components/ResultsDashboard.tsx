interface QuestionResult {
  questionNumber: number;
  marksAllocated: number;
  feedback: string;
}

interface EvaluationResult {
  totalMarks: number;
  averageScore: number;
  questions: QuestionResult[];
  overallFeedback: string;
}

const ResultsDashboard = ({ result }: { result: EvaluationResult }) => (
  <div className="space-y-8 animate-fade-in-up">
    {/* Summary cards */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Total Marks
        </p>
        <p className="mt-2 text-4xl font-bold text-foreground">
          {result.totalMarks}
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Average Score
        </p>
        <p className="mt-2 text-4xl font-bold text-foreground">
          {result.averageScore.toFixed(1)}
        </p>
      </div>
    </div>

    {/* Question-wise table */}
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary">
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              Q #
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              Marks
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              Feedback
            </th>
          </tr>
        </thead>
        <tbody>
          {result.questions.map((q, i) => (
            <tr
              key={q.questionNumber}
              className="border-b border-border last:border-0 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <td className="px-4 py-3 font-mono text-foreground">
                {q.questionNumber}
              </td>
              <td className="px-4 py-3 font-mono text-foreground">
                {q.marksAllocated}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {q.feedback}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Overall feedback */}
    <div className="rounded-lg border border-border bg-secondary/50 p-6">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Overall Feedback
      </p>
      <p className="mt-3 text-sm leading-relaxed text-foreground">
        {result.overallFeedback}
      </p>
    </div>
  </div>
);

export type { EvaluationResult };
export default ResultsDashboard;
