import * as XLSX from "xlsx";
import { Dialog } from "@headlessui/react";
import { useEffect } from "react";

export default function ExportCSVModal({ isOpen, onClose, leaderboard, segments, selectedSegmentId, isOverall }) {
    useEffect(() => {
        if (isOpen) {
            exportToExcel();
        }
    }, [isOpen]);

    const exportToExcel = () => {
        if (leaderboard.length === 0) {
            alert("No data to export.");
            onClose();
            return;
        }

        // Get Segment Name
        const segmentName = isOverall ? "Overall_Leaderboard" : segments.find(s => s.id === selectedSegmentId)?.name.replace(/\s+/g, "_") || "Segment";

        // Prepare Data
        const worksheetData = [
            ["", segmentName, ""], // Segment Title (Merged)
            ["Rank", "Name", "Score"], // Headers
            ...leaderboard.map((candidate, index) => [
                index + 1, 
                candidate.name, 
                `${Number(candidate.score).toFixed(2)}%`
            ])
        ];

        // Create a worksheet
        const ws = XLSX.utils.aoa_to_sheet(worksheetData);

        // Merge Segment Title (B1 across columns)
        ws["!merges"] = [{ s: { r: 0, c: 1 }, e: { r: 0, c: 2 } }];

        // Set Column Widths
        ws["!cols"] = [
            { wch: 8 },   // Rank
            { wch: 30 },  // Name (Wider for better readability)
            { wch: 12 }   // Score
        ];

        // Create Workbook and Save File
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Leaderboard");
        XLSX.writeFile(wb, `${segmentName}.xlsx`);

        // Close modal after download
        onClose();
    };


}
