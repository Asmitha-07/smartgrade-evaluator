import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { EvaluationResult } from "@/components/ResultsDashboard";

export function generateReport(result: EvaluationResult) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // ── Title ──
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("ScriptGrade — Evaluation Report", pageWidth / 2, y, { align: "center" });
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("AI-Based Automated Answer Evaluation System", pageWidth / 2, y, { align: "center" });
  y += 4;
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);
  y += 10;

  // ── Summary ──
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 14, y);
  y += 7;

  const summaryData = [
    ["Total Marks", `${result.totalMarksObtained} / ${result.maxMarks}`],
    ["Average Score", `${result.averageScore.toFixed(1)} / ${result.maxAverageScore.toFixed(1)}`],
    ["Grade", result.grade],
    ["Percentage", `${result.percentage}%`],
    ["Questions Attended", `${result.questionsAttended} / ${result.totalQuestions}`],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: summaryData,
    theme: "grid",
    headStyles: { fillColor: [30, 30, 30], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // ── Helper: check page break ──
  const checkPage = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 20;
    }
  };

  // ── Part-wise Results with Detailed Feedback ──
  for (const part of result.parts) {
    checkPage(30);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`${part.name}  (${part.markSplit})`, 14, y);
    y += 8;

    for (const q of part.questions) {
      checkPage(40);

      // Question header
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Q${q.questionNumber}  —  ${q.marksObtained} / ${q.maxMarks}`, 14, y);

      if (q.detailedFeedback) {
        const assess = q.detailedFeedback.overallAssessment;
        const assessWidth = doc.getTextWidth(assess);
        doc.setFillColor(assess === "Excellent" ? 220 : assess === "Good" ? 200 : assess === "Average" ? 255 : 255,
                         assess === "Excellent" ? 255 : assess === "Good" ? 220 : assess === "Average" ? 243 : 220,
                         assess === "Excellent" ? 220 : assess === "Good" ? 255 : assess === "Average" ? 200 : 220);
        doc.roundedRect(70, y - 4, assessWidth + 6, 6, 1, 1, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(assess, 73, y);
      }
      y += 6;

      // Brief feedback
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const fbLines = doc.splitTextToSize(q.feedback, pageWidth - 32);
      doc.text(fbLines, 18, y);
      y += fbLines.length * 4 + 2;

      if (q.detailedFeedback) {
        const df = q.detailedFeedback;

        // Strengths
        if (df.strengths.length > 0) {
          checkPage(15);
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(34, 139, 34);
          doc.text("✓ Strengths:", 18, y);
          doc.setTextColor(0);
          doc.setFont("helvetica", "normal");
          y += 4;
          for (const s of df.strengths) {
            checkPage(8);
            const lines = doc.splitTextToSize(`• ${s}`, pageWidth - 40);
            doc.text(lines, 22, y);
            y += lines.length * 4;
          }
          y += 2;
        }

        // Mistakes
        if (df.mistakes.length > 0) {
          checkPage(15);
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(200, 50, 50);
          doc.text("✗ Mistakes / Missing Points:", 18, y);
          doc.setTextColor(0);
          doc.setFont("helvetica", "normal");
          y += 4;
          for (const m of df.mistakes) {
            checkPage(8);
            const lines = doc.splitTextToSize(`• ${m}`, pageWidth - 40);
            doc.text(lines, 22, y);
            y += lines.length * 4;
          }
          y += 2;
        }

        // Suggestions
        if (df.suggestions.length > 0) {
          checkPage(15);
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(30, 100, 200);
          doc.text("💡 Suggestions:", 18, y);
          doc.setTextColor(0);
          doc.setFont("helvetica", "normal");
          y += 4;
          for (const s of df.suggestions) {
            checkPage(8);
            const lines = doc.splitTextToSize(`• ${s}`, pageWidth - 40);
            doc.text(lines, 22, y);
            y += lines.length * 4;
          }
          y += 2;
        }

        // Model Answer
        if (df.modelAnswer) {
          checkPage(20);
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(100, 50, 150);
          doc.text("📖 Model Answer:", 18, y);
          doc.setTextColor(0);
          doc.setFont("helvetica", "italic");
          y += 4;
          const maLines = doc.splitTextToSize(df.modelAnswer, pageWidth - 40);
          doc.text(maLines, 22, y);
          y += maLines.length * 4 + 2;
          doc.setFont("helvetica", "normal");
        }

        // Missing keywords
        if (df.missingKeywords && df.missingKeywords.length > 0) {
          checkPage(10);
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.text("Missing keywords: ", 18, y);
          doc.setFont("helvetica", "normal");
          doc.text(df.missingKeywords.join(", "), 18 + doc.getTextWidth("Missing keywords: "), y);
          y += 6;
        }
      }

      // Separator line
      doc.setDrawColor(220);
      doc.setLineWidth(0.2);
      doc.line(14, y, pageWidth - 14, y);
      y += 6;
    }
  }

  // ── Overall Feedback ──
  checkPage(30);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Overall Feedback", 14, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const feedbackLines = doc.splitTextToSize(result.overallFeedback, pageWidth - 28);
  doc.text(feedbackLines, 14, y);
  y += feedbackLines.length * 5 + 10;

  // ── Footer ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(130);
    doc.text(
      `Generated by ScriptGrade  •  Page ${i} of ${pageCount}  •  ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
    doc.setTextColor(0);
  }

  doc.save("ScriptGrade_Report.pdf");
}
