import * as XLSX from "xlsx";
import { useEffect } from "react";

export default function ExportCSVModal({
  isOpen,
  onClose,
  leaderboard,
  segments,
  selectedSegmentId,
  isOverall,
  judges,
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

    const segmentName = isOverall
      ? "Overall Leaderboard"
      : segments.find((s) => s.id === selectedSegmentId)?.name || "Segment";

    let headers, worksheetData;

    if (isOverall) {
      const segmentColumns = [];
      leaderboard.forEach((candidate) => {
        candidate.segments.forEach((segment) => {
          const segmentLabel = `${segment.segment_name} (${segment.segment_weight}%)`;
          if (!segmentColumns.includes(segmentLabel)) {
            segmentColumns.push(segmentLabel);
          }
        });
      });

      headers = ["Rank", "Name", ...segmentColumns, "Total Score"];

      worksheetData = [
        [{ v: segmentName, s: { font: { bold: true } } }, ...new Array(headers.length - 1).fill("")], // 🔥 Title Row
        new Array(headers.length).fill(""), // Blank Row
        headers, // Column Headers
        ...leaderboard.map((candidate, index) => {
          const row = [index + 1, candidate.name];
          segmentColumns.forEach((segmentLabel) => {
            const segmentObj = candidate.segments.find(
              (s) => `${s.segment_name} (${s.segment_weight}%)` === segmentLabel
            );
            row.push(segmentObj ? `${segmentObj.weighted_contribution}%` : "N/A");
          });
          row.push(candidate.total_score ? `${candidate.total_score}` : "N/A");
          return row;
        }),
        [], // 🏆 Empty row for spacing
        ["", ...judges.map((judge) => ({ v: judge.name, s: { font: { underline: true, bold: true }, alignment: { horizontal: "center" } } }))],
        ["", ...judges.map(() => ({ v: "Judge", s: { alignment: { horizontal: "center" } } }))],
      ];
    } else {
      const judgeNames = [];
      leaderboard.forEach((candidate) => {
        candidate.judge_scores.forEach((score) => {
          if (!judgeNames.includes(score.judge)) {
            judgeNames.push(score.judge);
          }
        });
      });

      headers = ["Rank", "Name", ...judgeNames, "Total Score"];

      worksheetData = [
        [{ v: segmentName, s: { font: { bold: true } } }, ...new Array(headers.length - 1).fill("")], // 🔥 Title Row
        new Array(headers.length).fill(""), // Blank Row
        headers, // Column Headers
        ...leaderboard.map((candidate, index) => {
          const row = [index + 1, candidate.name];
          judgeNames.forEach((judge) => {
            const scoreObj = candidate.judge_scores.find((s) => s.judge === judge);
            row.push(scoreObj ? `${scoreObj.judge_total}%` : "N/A");
          });
          row.push(candidate.judge_total ? `${candidate.judge_total}` : "N/A");
          return row;
        }),
        [], // 🏆 Empty row for spacing
        ["", ...judgeNames.map((judge) => ({ v: judge, s: { font: { underline: true, bold: true }, alignment: { horizontal: "center" } } }))],
        ["", ...judgeNames.map(() => ({ v: "Judge", s: { alignment: { horizontal: "center" } } }))],
      ];
    }

    // 📊 Create Worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // 🔥 Merge Title Row
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
    ];

    // 📏 Adjust Column Widths
    ws["!cols"] = headers.map(() => ({ wch: 15 }));

    // 🎯 Apply Center Alignment to All Cells
    Object.keys(ws).forEach((cell) => {
      if (cell[0] !== "!") {
        ws[cell].s = {
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
    });

    // 📖 Create & Save Excel File
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leaderboard");
    XLSX.writeFile(wb, `${segmentName}.xlsx`);

    // ✅ Close Modal After Download
    onClose();
  };

  return null; // No UI, purely triggers download
}
