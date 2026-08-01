"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, X, Check, RotateCcw, Sparkles, Send, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  getWhatsAppTemplates,
  setWhatsAppTemplates,
  DEFAULT_WHATSAPP_TEMPLATES,
  generateWhatsAppMessage,
  WhatsAppTemplateItem,
} from "@/lib/whatsapp";
import { Business } from "@/lib/types";

interface WhatsAppTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  sampleBusiness?: Partial<Business>;
}

const TEMPLATE_VARIABLES = [
  { tag: "{name}", label: "Business Name" },
  { tag: "{city}", label: "City Location" },
  { tag: "{category}", label: "Category" },
  { tag: "{phone}", label: "Phone Number" },
  { tag: "{rating}", label: "Google Rating" },
  { tag: "{website}", label: "Website URL" },
];

export function WhatsAppTemplateModal({ isOpen, onClose, sampleBusiness }: WhatsAppTemplateModalProps) {
  const [templates, setTemplates] = useState<WhatsAppTemplateItem[]>(DEFAULT_WHATSAPP_TEMPLATES);
  const [activeTabId, setActiveTabId] = useState<number>(1);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const defaultSampleBiz: Partial<Business> = sampleBusiness || {
    name: "Apex Dental Care",
    city: "Delhi",
    category: "Dentist Clinic",
    phone: "+91 98765 43210",
    rating: 4.8,
    website: "https://apexdental.com",
  };

  useEffect(() => {
    if (isOpen) {
      setTemplates(getWhatsAppTemplates());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTemplateObj = templates.find((t) => t.id === activeTabId) || templates[0];

  const handleUpdateCurrentText = (newText: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, text: newText } : t))
    );
  };

  const handleUpdateCurrentName = (newName: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, name: newName } : t))
    );
  };

  const handleInsertVariable = (variable: string) => {
    handleUpdateCurrentText(currentTemplateObj.text + " " + variable);
  };

  const handleSaveAll = () => {
    setWhatsAppTemplates(templates);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleResetAll = () => {
    setTemplates(DEFAULT_WHATSAPP_TEMPLATES);
  };

  const livePreviewMessage = generateWhatsAppMessage(currentTemplateObj.text, defaultSampleBiz);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/30 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  WhatsApp 4-Message Sequence Config
                </h2>
                <p className="text-xs text-slate-400">
                  Set 4 different preset messages (Msg 1 to Msg 4) to send 1-by-1 to clients
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 4 Template Navigation Tabs */}
          <div className="px-6 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto py-2">
            {templates.map((t, idx) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTabId(t.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTabId === t.id
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40"
                    : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message {t.id}</span>
                <span className="opacity-70 text-[10px]">({t.name.replace(/Msg \d: /i, "")})</span>
              </button>
            ))}
          </div>

          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Template Title input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Message Slot Name / Purpose:</label>
              <input
                type="text"
                value={currentTemplateObj.name}
                onChange={(e) => handleUpdateCurrentName(e.target.value)}
                placeholder="e.g. Msg 1: Initial Pitch..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            {/* Variable insertion tags */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Insert Dynamic Variables:
              </label>
              <div className="flex flex-wrap gap-2">
                {TEMPLATE_VARIABLES.map((v) => (
                  <button
                    key={v.tag}
                    type="button"
                    onClick={() => handleInsertVariable(v.tag)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-indigo-600/30 hover:border-indigo-500 border border-slate-700 text-slate-200 text-xs rounded-xl font-mono transition-all flex items-center gap-1 group"
                  >
                    <span className="text-emerald-400 font-bold group-hover:text-emerald-300">{v.tag}</span>
                    <span className="text-[10px] text-slate-400">({v.label})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Editor Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  Message {currentTemplateObj.id} Text:
                </label>
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Reset All Defaults
                </button>
              </div>
              <textarea
                value={currentTemplateObj.text}
                onChange={(e) => handleUpdateCurrentText(e.target.value)}
                rows={4}
                placeholder="Type your custom WhatsApp outreach text here..."
                className="w-full p-4 bg-slate-950 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed font-sans"
              />
            </div>

            {/* Realtime Live WhatsApp Chat Preview Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-emerald-400" /> Live WhatsApp Chat Preview (Msg {currentTemplateObj.id}):
              </label>
              <div className="p-4 bg-[#0b141a] border border-slate-800 rounded-2xl shadow-inner relative overflow-hidden">
                <div className="max-w-[85%] bg-[#005c4b] text-slate-100 p-3 rounded-2xl rounded-tl-none shadow-md text-xs sm:text-sm space-y-1 relative">
                  <div className="text-[10px] font-bold text-emerald-300 block mb-0.5">
                    ~ LeadX Outreach Assistant ({currentTemplateObj.name})
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{livePreviewMessage}</p>
                  <div className="text-[9px] text-emerald-200/70 text-right font-mono mt-1">
                    10:42 AM ✓✓
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              {savedSuccess ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" /> All 4 Message Templates Saved!
                </span>
              ) : (
                "All 4 message templates are saved locally in your browser."
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveAll}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                <Check className="w-4 h-4 mr-1" /> Save All Templates
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
