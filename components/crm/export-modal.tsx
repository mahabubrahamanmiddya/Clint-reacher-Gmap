"use client";

import React, { useState } from "react";
import { X, Download, FileText, Table, Code, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { json2csv } from "json2csv";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeadIds: number[];
  allLeads: any[];
}

export function ExportModal({ isOpen, onClose, selectedLeadIds, allLeads }: ExportModalProps) {
  const [format, setFormat] = useState<"csv" | "excel" | "json">("csv");
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const leadsToExport = selectedLeadIds.length > 0
    ? allLeads.filter((l) => selectedLeadIds.includes(l.id || l.business_id))
    : allLeads;

  const handleDownload = () => {
    setIsExporting(true);

    setTimeout(() => {
      const cleanData = leadsToExport.map((item) => {
        const b = item.business || item;
        return {
          "Business Name": b.name || "",
          "Phone": b.phone || "",
          "Website": b.website || "",
          "Email": b.email || "",
          "Address": b.address || "",
          "City": b.city || "",
          "State": b.state || "",
          "Pincode": b.pincode || "",
          "Rating": b.rating || "",
          "Reviews Count": b.reviews_count || "",
          "Category": b.category || "",
          "AI Score": b.ai_score || "",
          "Google Maps Link": b.google_maps_url || "",
          "Status": item.status || "New",
        };
      });

      if (format === "csv") {
        try {
          const csv = json2csv(cleanData);
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", `leadx_export_${Date.now()}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (e) {
          console.error(e);
        }
      } else if (format === "excel") {
        const worksheet = XLSX.utils.json_to_sheet(cleanData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "LeadX Leads");
        XLSX.writeFile(workbook, `leadx_export_${Date.now()}.xlsx`);
      } else if (format === "json") {
        const jsonStr = JSON.stringify(cleanData, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `leadx_export_${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setIsExporting(false);
      onClose();
    }, 500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Export Lead Data</h3>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-300">
            Exporting <span className="font-bold text-indigo-400">{leadsToExport.length}</span> lead records into your preferred file format:
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "csv", label: "CSV File", icon: FileText, desc: "Standard spreadsheet" },
              { id: "excel", label: "Excel (.xlsx)", icon: Table, desc: "Formatted workbook" },
              { id: "json", label: "JSON Data", icon: Code, desc: "Developer API format" },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = format === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFormat(item.id as any)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                    isSelected
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md"
                      : "bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? "text-indigo-400" : "text-slate-400"}`} />
                  <span className="text-xs font-bold">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDownload}
              isLoading={isExporting}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              <Download className="w-4 h-4" /> Download Export
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
