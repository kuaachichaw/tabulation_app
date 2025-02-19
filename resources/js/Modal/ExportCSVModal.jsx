import * as XLSX from "xlsx";
import { useEffect } from "react";

export default function ExportCSVModal({
  isOpen,
  onClose,
  leaderboard,
  segments,
  selectedSegmentId,
  isOverall,
  judges // Pass judges data from Leaderboard.jsx
}) {
  useEffect(() => {
    if (isOpen) {
      exportToExcel();
    }
  }, [isOpen]);

  const exportToExcel = () => {
    if (!leaderboard || leaderboard.length === 0) {
      alert("No data to export.");
      onClose();
      return;
    }

    // 🏆 Define Segment Name
    const segmentName = isOverall
      ? "Overall_Leaderboard"
      : segments.find((s) => s.id === selectedSegmentId)?.name.replace(/\s+/g, "_") || "Segment";

    // 📌 Extract Unique Judges
    const judgeNames = [];
    leaderboard.forEach((candidate) => {
      candidate.judge_scores.forEach((score) => {
        if (!judgeNames.includes(score.judge)) {
          judgeNames.push(score.judge);
        }
      });
    });

    // 📌 Create Headers
    const headers = ["Rank", "Name", ...judgeNames, "Total Score"];

    // 📌 Prepare Table Data
    const worksheetData = [
      ["", "Best in Production Number", "", ...new Array(judgeNames.length).fill("")], // Title Row (Merged)
      headers, // Column Headers
      ...leaderboard.map((candidate, index) => {
        const row = [
          index + 1, // Rank
          candidate.name, // Candidate Name
        ];

        // 🎯 Insert Judge Scores
        judgeNames.forEach((judge) => {
          const scoreObj = candidate.judge_scores.find((s) => s.judge === judge);
          row.push(scoreObj ? `${scoreObj.judge_total}%` : "N/A");
        });

        // 🏆 Add Total Score
        row.push(candidate.judge_total ? `${candidate.judge_total}%` : "N/A");

        return row;
      }),
    ];

    // 📊 Create Worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // 🔥 Merge Title Row (B1 Across Columns)
    ws["!merges"] = [{ s: { r: 0, c: 1 }, e: { r: 0, c: headers.length - 1 } }];

    // 📏 Adjust Column Widths
    ws["!cols"] = [{ wch: 8 }, { wch: 30 }, ...new Array(judgeNames.length).fill({ wch: 15 }), { wch: 12 }];

    // 📖 Create & Save Excel File
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leaderboard");
    XLSX.writeFile(wb, `${segmentName}.xlsx`);

    // ✅ Close Modal After Download
    onClose();
  };
}
