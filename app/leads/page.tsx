"use client";

import React, { useState, useEffect } from "react";
import { SavedLead, LeadList } from "@/lib/types";
import { getSavedLeads, updateLeadStatus, deleteLead, bulkUpdateStatus } from "@/lib/api";
import { copyToClipboard, getStatusColor } from "@/lib/utils";
import {
  Database, Download, Plus, Star, Phone, Globe, Mail, MapPin, ExternalLink,
  Trash2, Copy, Tag, Check, Filter, Layers, LayoutGrid, List
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExportModal } from "@/components/crm/export-modal";
import { LeadDetailsModal } from "@/components/crm/lead-details-modal";
import { motion, AnimatePresence } from "framer-motion";

const PIPELINE_STAGES = ["New", "Contacted", "Interested", "Not Interested", "Closed"];

export function SavedLeadsPage() {
  const [leads, setLeads] = useState<SavedLead[]>([]);
  const [selectedList, setSelectedList] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [detailsBiz, setDetailsBiz] = useState<any>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, [selectedStatus, selectedList]);

  const fetchLeads = async () => {
    const data = await getSavedLeads(
      selectedStatus === "All" ? undefined : selectedStatus,
      selectedList === "All" ? undefined : selectedList
    );
    setLeads(data);
  };

  const handleStatusChange = async (leadId: number, newStatus: string) => {
    await updateLeadStatus(leadId, newStatus);
    setLeads(leads.map((l) => (l.id === leadId ? { ...l, status: newStatus as any } : l)));
  };

  const handleDeleteLead = async (leadId: number) => {
    await deleteLead(leadId);
    setLeads(leads.filter((l) => l.id !== leadId));
  };

  const triggerCopy = (text: string, label: string) => {
    copyToClipboard(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filteredLeads = leads.filter((l) => {
    if (selectedStatus !== "All" && l.status !== selectedStatus) return false;
    if (selectedList !== "All" && l.list_name !== selectedList) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Toast Feedback */}
      <AnimatePresence>
        {copiedText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold"
          >
            <Check className="w-4 h-4 text-emerald-300" /> Copied {copiedText}!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white">CRM Saved Lead Pipeline</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your saved lead lists, pipeline status stages, notes timeline, and 1-click bulk exports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center gap-1">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === "table" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <List className="w-4 h-4" /> Table View
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === "kanban" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> Kanban Pipeline
            </button>
          </div>

          <Button
            variant="primary"
            onClick={() => setExportModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-xs"
          >
            <Download className="w-4 h-4" /> Export All ({filteredLeads.length})
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Lead Lists */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 glass-card rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-2">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Lead Lists:
          </span>
          {["All", "Delhi Dentists", "Mumbai Restaurants", "General"].map((listName) => (
            <button
              key={listName}
              onClick={() => setSelectedList(listName)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                selectedList === listName
                  ? "bg-indigo-600 text-white border-indigo-500"
                  : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}
            >
              {listName}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none"
          >
            <option value="All">All Statuses</option>
            {PIPELINE_STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* View Mode Switcher */}
      {viewMode === "table" ? (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[11px]">
                  <th className="p-3.5">Business Name</th>
                  <th className="p-3.5">Contact Details</th>
                  <th className="p-3.5">Address</th>
                  <th className="p-3.5">Pipeline Status</th>
                  <th className="p-3.5">Lead List</th>
                  <th className="p-3.5">AI Score</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No saved leads match your filter selection.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const b = lead.business;
                    return (
                      <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-bold text-white">
                          <button
                            onClick={() => setDetailsBiz(b)}
                            className="hover:text-indigo-400 transition-colors text-left"
                          >
                            {b.name}
                          </button>
                          <div className="text-[11px] text-slate-400 font-normal">
                            {b.category || "Business"} — {b.rating}★ ({b.reviews_count})
                          </div>
                        </td>

                        <td className="p-3.5 space-y-1">
                          {b.phone && (
                            <div className="flex items-center gap-1 text-xs font-mono text-slate-300">
                              <Phone className="w-3 h-3 text-emerald-400" />
                              {b.phone}
                              <button
                                onClick={() => triggerCopy(b.phone!, "Phone")}
                                className="p-1 hover:text-white text-slate-500"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          {b.website && (
                            <div className="flex items-center gap-1 text-xs text-indigo-400 truncate max-w-[140px]">
                              <Globe className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                              <a href={b.website} target="_blank" rel="noreferrer" className="truncate hover:underline">
                                {b.website.replace("https://", "")}
                              </a>
                            </div>
                          )}
                        </td>

                        <td className="p-3.5 text-xs text-slate-400 line-clamp-2 max-w-[200px]">
                          {b.address}
                        </td>

                        <td className="p-3.5">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border outline-none cursor-pointer ${getStatusColor(lead.status)}`}
                          >
                            {PIPELINE_STAGES.map((s) => (
                              <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>
                            ))}
                          </select>
                        </td>

                        <td className="p-3.5">
                          <Badge variant="purple">{lead.list_name}</Badge>
                        </td>

                        <td className="p-3.5">
                          <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                            {b.ai_score}
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteLead(lead.id)}
                            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-1.5"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban Pipeline View */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.status === stage);
            return (
              <div key={stage} className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col min-h-[450px]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      stage === "New" ? "bg-blue-400" : stage === "Contacted" ? "bg-amber-400" : stage === "Interested" ? "bg-emerald-400" : stage === "Closed" ? "bg-purple-400" : "bg-rose-400"
                    }`} />
                    {stage}
                  </h3>
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold flex items-center justify-center">
                    {stageLeads.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {stageLeads.map((lead) => {
                    const b = lead.business;
                    return (
                      <div
                        key={lead.id}
                        className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-indigo-500/40 transition-all space-y-2 group shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <h4
                            onClick={() => setDetailsBiz(b)}
                            className="text-xs font-bold text-white hover:text-indigo-400 cursor-pointer line-clamp-1"
                          >
                            {b.name}
                          </h4>
                          <span className="text-[10px] font-bold text-amber-400">{b.rating}★</span>
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-1">{b.address}</p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px]">
                          <span className="text-purple-300 font-mono">{b.phone || "No phone"}</span>
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            className="bg-slate-800 text-slate-300 border border-slate-700 rounded px-1 py-0.5"
                          >
                            {PIPELINE_STAGES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Profile Modal */}
      <LeadDetailsModal
        business={detailsBiz}
        isOpen={!!detailsBiz}
        onClose={() => setDetailsBiz(null)}
        onSaveLead={() => {}}
        isSaved={true}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        selectedLeadIds={selectedIds}
        allLeads={filteredLeads}
      />
    </div>
  );
}

export default SavedLeadsPage;
