"use client";

import React, { useState } from "react";
import { Business, Note, Tag as TagType } from "@/lib/types";
import { copyToClipboard } from "@/lib/utils";
import {
  X, Star, Globe, Phone, Mail, MapPin, ExternalLink, Copy, Sparkles,
  MessageSquare, Tag, Plus, Check, ShieldAlert, Zap, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface LeadDetailsModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveLead: (biz: Business) => void;
  isSaved?: boolean;
}

export function LeadDetailsModal({
  business,
  isOpen,
  onClose,
  onSaveLead,
  isSaved = false,
}: LeadDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "preview" | "notes" | "ai">("overview");
  const [notes, setNotes] = useState<Note[]>([
    { id: 1, content: "Initial research: Active clinic, good reputation on Google.", created_at: "2026-07-26T14:20:00Z" }
  ]);
  const [newNote, setNewNote] = useState("");
  const [tags, setTags] = useState<TagType[]>([
    { id: 1, name: "Verified", color: "#10b981" },
    { id: 2, name: "Hot Prospect", color: "#6366f1" }
  ]);
  const [newTagText, setNewTagText] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isOpen || !business) return null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes([
      { id: Date.now(), content: newNote.trim(), created_at: new Date().toISOString() },
      ...notes
    ]);
    setNewNote("");
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagText.trim()) return;
    const colors = ["#6366f1", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
    setTags([
      ...tags,
      { id: Date.now(), name: newTagText.trim(), color: colors[tags.length % colors.length] }
    ]);
    setNewTagText("");
  };

  const handleCopy = (text: string) => {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header Banner */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-xl shadow-lg">
                {business.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{business.name}</h2>
                  <Badge variant="cyan">{business.category || "Business"}</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {business.address}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={isSaved ? "primary" : "secondary"}
                onClick={() => onSaveLead(business)}
                className="text-xs"
              >
                {isSaved ? "Saved to CRM" : "Save Lead"}
              </Button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 border-b border-slate-800 bg-slate-900/60 flex items-center gap-4">
            {[
              { id: "overview", label: "Business Info" },
              { id: "ai", label: "AI Lead Score" },
              { id: "notes", label: `Notes (${notes.length})` },
              { id: "preview", label: "Website Preview" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="p-6 overflow-y-auto flex-1">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Details Card */}
                <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl space-y-4">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                    Contact & Online Presence
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-400" /> Phone
                      </span>
                      <span className="text-white font-mono">{business.phone || "N/A"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-cyan-400" /> Website
                      </span>
                      {business.website ? (
                        <a href={business.website} target="_blank" rel="noreferrer" className="text-indigo-400 underline">
                          {business.website.replace("https://", "")}
                        </a>
                      ) : (
                        <span className="text-slate-500">N/A</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-purple-400" /> Email
                      </span>
                      <span className="text-purple-300 font-mono">{business.email || "N/A"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Rating
                      </span>
                      <span className="text-amber-400 font-bold">{business.rating} / 5.0 ({business.reviews_count} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Tags & Quick Actions */}
                <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl space-y-4">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                    Custom Lead Tags
                  </h3>

                  <div className="flex flex-wrap items-center gap-2">
                    {tags.map((t) => (
                      <span
                        key={t.id}
                        className="px-2.5 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1.5"
                        style={{ backgroundColor: t.color + "33", borderColor: t.color, borderWidth: 1 }}
                      >
                        <Tag className="w-3 h-3" style={{ color: t.color }} />
                        {t.name}
                      </span>
                    ))}
                  </div>

                  <form onSubmit={handleAddTag} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={newTagText}
                      onChange={(e) => setNewTagText(e.target.value)}
                      placeholder="Add tag (e.g. VIP, Priority)..."
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                    <Button type="submit" size="sm" variant="secondary">
                      <Plus className="w-3.5 h-3.5" /> Tag
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="space-y-4">
                <div className="p-5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg">
                      {business.ai_score}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-cyan-300" /> AI Lead Health Index
                      </h4>
                      <p className="text-xs text-slate-400">High probability conversion candidate</p>
                    </div>
                  </div>
                  <Badge variant="emerald">Grade A Lead</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
                    <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> Key Strengths
                    </h5>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      <li>Strong Google Rating ({business.rating} Stars)</li>
                      <li>Verified business domain & phone contact</li>
                      <li>Active operational status</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2">
                    <h5 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Zap className="w-4 h-4" /> Recommended Outreach Angle
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Pitch local SEO expansion, review automation software, or direct B2B marketing retainer.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-4">
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Type call outcome, outreach notes, or follow up date..."
                    className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
                  />
                  <Button type="submit" variant="primary" size="sm">
                    <Plus className="w-4 h-4" /> Add Note
                  </Button>
                </form>

                <div className="space-y-2 pt-2">
                  {notes.map((n) => (
                    <div key={n.id} className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl flex items-start justify-between">
                      <p className="text-xs text-slate-200">{n.content}</p>
                      <span className="text-[10px] text-slate-500 font-mono ml-4">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "preview" && (
              <div className="h-[350px] w-full rounded-xl border border-slate-800 overflow-hidden bg-slate-950 relative flex flex-col items-center justify-center p-6 text-center">
                {business.website ? (
                  <iframe
                    src={business.website}
                    className="w-full h-full border-0"
                    title="Website Preview"
                  />
                ) : (
                  <div className="space-y-2">
                    <Globe className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-sm font-semibold text-slate-400">No live website URL provided for this business.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
