import * as XLSX from "xlsx";
import { useEffect } from "react";

export default function ExportPairCSVModal({
  isOpen,
  onClose,
  leaderboard,
  pairSegments,
  selectedSegmentId,
  isOverall,
  judges,
  displayMode,
  genderFilter,
}) {
  useEffect(() => {
    if (isOpen) {
      exportToExcel();
    }
  }, [isOpen]);

  const exportToExcel = () => {
    const exportData = leaderboard || { male: [], female: [] };

    // Check if we have data for the selected gender
    const hasData = genderFilter
      ? exportData[genderFilter]?.length > 0
      : exportData.male?.length > 0 || exportData.female?.length > 0;

    if (!hasData) {
      alert(`No ${genderFilter || 'pair'} data available to export.`);
      onClose();
      return;
    }

    const segmentName = isOverall
      ? `Overall Pair Leaderboard - ${genderFilter ? genderFilter.charAt(0).toUpperCase() + genderFilter.slice(1) : ''}`
      : pairSegments.find((s) => s.id === selectedSegmentId)?.pair_name || "Pair Segment";

    const wb = XLSX.utils.book_new();

    if ((genderFilter === 'male' || !genderFilter) && exportData.male?.length > 0) {
      const maleWorksheet = createPairWorksheet(
        exportData.male,
        segmentName,
        isOverall,
        judges,
        'male'
      );
      XLSX.utils.book_append_sheet(wb, maleWorksheet, "Male Pairs");
    }

    if ((genderFilter === 'female' || !genderFilter) && exportData.female?.length > 0) {
      const femaleWorksheet = createPairWorksheet(
        exportData.female,
        segmentName,
        isOverall,
        judges,
        'female'
      );
      XLSX.utils.book_append_sheet(wb, femaleWorksheet, "Female Pairs");
    }

    XLSX.writeFile(wb, `${segmentName.replace(/ /g, '_')}.xlsx`);
    onClose();
  };

  const createPairWorksheet = (data, title, isOverall, judges, gender) => {
    let headers, worksheetData;

    if (isOverall) {
      // Get segment weights from the first candidate's data
      const weightedSegments = data[0]?.segments || [];
      
      // Prepare headers with segment names and weights
      const segmentHeaders = weightedSegments.map(segment => {
        // Ensure weight is properly formatted
        const weight = segment.weight !== undefined ? segment.weight : 0;
        return `${segment.segment_name}(${weight}%)`;
      });

      headers = ["Rank", "Pair Name", "Candidate Name", ...segmentHeaders, "Total Score"];
      
      worksheetData = [
        // Title row (merged)
        [{ v: title, s: { font: { bold: true, sz: 16 } } }, ...new Array(headers.length - 1).fill("")],
        
        // Empty row
        new Array(headers.length).fill(""),
        
        // Column headers
        headers.map(header => ({
          v: header,
          s: { 
            font: { bold: true, color: { rgb: "FFFFFF" } }, 
            fill: { fgColor: { rgb: "4F81BD" } },
            alignment: { horizontal: "center", vertical: "center" }
          }
        })),
        
        // Data rows
        ...data.map(candidate => [
          candidate.rank || "",
          candidate.pair_name || "",
          candidate.name || "Unknown Candidate",
          ...weightedSegments.map(segment => {
            const segmentScore = candidate.segments?.find(s => 
              s.segment_id === segment.segment_id
            );
            // Format score with single percentage sign
            const score = segmentScore ? 
              `${parseFloat(segmentScore.normalized_score).toFixed(2)}%` : "N/A";
            return score;
          }),
          candidate.total_score ? 
            `${parseFloat(candidate.total_score).toFixed(2)}%` : "N/A"
        ]),
        
        // Empty row
        new Array(headers.length).fill(""),
        
        // Judges row - starting from column B (index 1)
        ["", ...judges.map(judge => ({
          v: judge.name,
          s: { font: { italic: true } }
        })), ...new Array(headers.length - judges.length - 1).fill("")],
        
        // Judge labels - starting from column B (index 1)
        ["", ...judges.map(() => "Judge"), ...new Array(headers.length - judges.length - 1).fill("")]
      ];
    } else {
      // Segment-specific export
      const selectedSegment = pairSegments.find(s => s.id === selectedSegmentId);
      const weight = selectedSegment?.weight !== undefined ? selectedSegment.weight : 0;
      const segmentTitle = `${selectedSegment?.pair_name || ''} (${weight}%)`;
      
      headers = ["Rank", "Pair Name", "Candidate Name", ...judges.map(j => j.name), "Total Score"];
      
      worksheetData = [
        // Title row (merged)
        [{ v: segmentTitle, s: { font: { bold: true, sz: 16 } } }, ...new Array(headers.length - 1).fill("")],
        
        // Empty row
        new Array(headers.length).fill(""),
        
        // Column headers
        headers.map(header => ({
          v: header,
          s: { 
            font: { bold: true, color: { rgb: "FFFFFF" } }, 
            fill: { fgColor: { rgb: "4F81BD" } },
            alignment: { horizontal: "center", vertical: "center" }
          }
        })),
        
        // Data rows
        ...data.map(candidate => [
          candidate.rank || "",
          candidate.pair_name || "",
          candidate.name || "Unknown Candidate",
          ...judges.map(judge => {
            const score = candidate.judge_scores?.find(s => s.judge === judge.name);
            // Format score with single percentage sign
            const formattedScore = score ? 
              `${parseFloat(score.judge_total).toFixed(2)}%` : "N/A";
            return formattedScore;
          }),
          candidate.judge_score ? 
            `${parseFloat(candidate.judge_score).toFixed(2)}%` : "N/A"
        ]),
        
        // Empty row
        new Array(headers.length).fill(""),
        
        // Judges row - starting from column B (index 1)
        ["", ...judges.map(judge => ({
          v: judge.name,
          s: { font: { italic: true } }
        })), ...new Array(headers.length - judges.length - 1).fill("")],
        
        // Judge labels - starting from column B (index 1)
        ["", ...judges.map(() => "Judge"), ...new Array(headers.length - judges.length - 1).fill("")]
      ];
    }

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Merge title row
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }
    ];

    // Set column widths
    ws["!cols"] = headers.map((h, i) => {
      if (i === 0) return { wch: 8 };   // Rank column
      if (i === 1) return { wch: 20 };  // Pair Name
      if (i === 2) return { wch: 25 };  // Candidate Name
      return { wch: 15 };               // Other columns
    });

    // Apply styles to all cells
    const range = XLSX.utils.decode_range(ws['!ref']);
    for(let R = range.s.r; R <= range.e.r; ++R) {
      for(let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = {c:C, r:R};
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        if(!ws[cell_ref]) continue;
        ws[cell_ref].s = {
          ...ws[cell_ref].s,
          alignment: { 
            horizontal: "center", 
            vertical: "center",
            wrapText: true
          },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }
    }

    return ws;
  };

  return null;
}