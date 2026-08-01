"use client";

import React, { useState, useEffect, useRef } from "react";
import { Business } from "@/lib/types";
import {
  getWhatsAppTemplates,
  generateWhatsAppMessage,
  generateWhatsAppUrl,
  buildWhatsAppDirectUrl,
  formatPhoneForWhatsApp,
  WhatsAppTemplateItem,
} from "@/lib/whatsapp";
import {
  MessageSquare,
  Play,
  Pause,
  SkipForward,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Clock,
  Sparkles,
  RefreshCw,
  Send,
  Edit2,
  Check,
  PhoneCall,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface BulkWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: Business[];
  onLeadProcessed?: (leadId: number, status: string) => void;
}

export interface QueueItem {
  business: Business;
  formattedPhone: string | null;
  status: "pending" | "sent" | "skipped" | "error";
  messageText: string;
}

export function BulkWhatsAppModal({
  isOpen,
  onClose,
  businesses,
  onLeadProcessed,
}: BulkWhatsAppModalProps) {
  const [templates, setTemplates] = useState<WhatsAppTemplateItem[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>(1);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoSending, setIsAutoSending] = useState<boolean>(false);
  const [autoIntervalSeconds, setAutoIntervalSeconds] = useState<number>(3);
  const [countdown, setCountdown] = useState<number>(3);

  // Phone Edit state
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editPhoneValue, setEditPhoneValue] = useState<string>("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize queue when modal opens or businesses change
  useEffect(() => {
    if (isOpen) {
      const tList = getWhatsAppTemplates();
      setTemplates(tList);

      const activeT = tList.find((t) => t.id === selectedTemplateId) || tList[0];

      const initialQueue: QueueItem[] = businesses.map((b) => {
        const cleanP = formatPhoneForWhatsApp(b.phone);
        const msg = generateWhatsAppMessage(activeT.text, b);
        return {
          business: b,
          formattedPhone: cleanP,
          status: cleanP ? "pending" : "skipped",
          messageText: msg,
        };
      });

      setQueue(initialQueue);

      // Find first non-skipped index
      const firstValidIdx = initialQueue.findIndex((q) => q.status === "pending");
      setCurrentIndex(firstValidIdx >= 0 ? firstValidIdx : 0);
      setIsAutoSending(false);
      setCountdown(autoIntervalSeconds);
    }
  }, [isOpen, businesses]);

  // Recalculate preview messages when selected template changes
  const handleTemplateChange = (templateId: number) => {
    setSelectedTemplateId(templateId);
    const activeT = templates.find((t) => t.id === templateId) || templates[0];

    setQueue((prevQueue) =>
      prevQueue.map((item) => ({
        ...item,
        messageText: generateWhatsAppMessage(activeT.text, item.business),
      }))
    );
  };

  const handleStartEditPhone = (idx: number, currentPhone: string | null) => {
    setEditingIdx(idx);
    setEditPhoneValue(currentPhone || "+91 ");
  };

  const handleSavePhoneEdit = (idx: number) => {
    const updatedPhone = editPhoneValue.trim();
    const cleanP = formatPhoneForWhatsApp(updatedPhone);
    const activeT = templates.find((t) => t.id === selectedTemplateId) || templates[0];

    setQueue((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const updatedBiz = { ...item.business, phone: updatedPhone };
        return {
          ...item,
          business: updatedBiz,
          formattedPhone: cleanP,
          status: cleanP && item.status === "skipped" ? "pending" : item.status,
          messageText: generateWhatsAppMessage(activeT.text, updatedBiz),
        };
      })
    );

    setEditingIdx(null);
    setEditPhoneValue("");
  };

  const currentIndexRef = useRef<number>(0);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Auto Send Timer Loop
  useEffect(() => {
    if (!isAutoSending) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          triggerSendCurrent();
          return autoIntervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoSending, autoIntervalSeconds]);

  if (!isOpen) return null;

  const currentItem = queue[currentIndex];
  const totalCount = queue.length;
  const sentCount = queue.filter((q) => q.status === "sent").length;
  const skippedCount = queue.filter((q) => q.status === "skipped").length;
  const pendingCount = queue.filter((q) => q.status === "pending").length;
  const progressPercent = totalCount > 0 ? Math.round(((sentCount + skippedCount) / totalCount) * 100) : 0;

  const triggerSendCurrent = () => {
    const activeIdx = currentIndexRef.current;
    const activeItem = queue[activeIdx];

    if (!activeItem || activeItem.status === "skipped") {
      advanceQueue();
      return;
    }

    const url = buildWhatsAppDirectUrl(
      activeItem.business.phone,
      activeItem.messageText
    );

    if (url) {
      window.open(url, "LeadXWhatsAppTab");

      // Update item status to sent
      setQueue((prev) =>
        prev.map((q, idx) => (idx === activeIdx ? { ...q, status: "sent" } : q))
      );

      if (onLeadProcessed) {
        onLeadProcessed(activeItem.business.id, "Contacted");
      }
    }

    advanceQueue();
  };

  const handleStartAutoSend = () => {
    setIsAutoSending(true);
    triggerSendCurrent();
  };

  const handleSkipCurrent = () => {
    setQueue((prev) =>
      prev.map((q, idx) => (idx === currentIndex ? { ...q, status: "skipped" } : q))
    );
    advanceQueue();
  };

  const advanceQueue = () => {
    setCountdown(autoIntervalSeconds);
    let nextIdx = currentIndex + 1;
    // Find next non-processed item
    while (nextIdx < totalCount && queue[nextIdx]?.status === "skipped") {
      nextIdx++;
    }

    if (nextIdx < totalCount) {
      setCurrentIndex(nextIdx);
    } else {
      setIsAutoSending(false);
      setCurrentIndex(totalCount);
    }
  };

  const handleResetQueue = () => {
    setIsAutoSending(false);
    const activeT = templates.find((t) => t.id === selectedTemplateId) || templates[0];
    setQueue(
      businesses.map((b) => {
        const cleanP = formatPhoneForWhatsApp(b.phone);
        return {
          business: b,
          formattedPhone: cleanP,
          status: cleanP ? "pending" : "skipped",
          messageText: generateWhatsAppMessage(activeT.text, b),
        };
      })
    );
    setCurrentIndex(0);
    setCountdown(autoIntervalSeconds);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-3xl glass-card bg-[#0A1128] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-[#0F1A3A] via-[#0A1128] to-[#14234C] border-b border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  1-Click WhatsApp Sequencer
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                    {totalCount} Leads Batch
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Send personalized WhatsApp messages 1-by-1 automatically without browser popup blocks.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsAutoSending(false);
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Configuration & Progress Section */}
          <div className="p-5 border-b border-slate-800/80 bg-[#0F1A3A]/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Template Picker */}
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs text-slate-400 font-semibold flex-shrink-0">Template:</span>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(Number(e.target.value))}
                  disabled={isAutoSending}
                  className="w-full bg-[#0A1128] border border-amber-500/30 text-amber-200 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Timer Speed Interval */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold flex-shrink-0">Gap:</span>
                <select
                  value={autoIntervalSeconds}
                  onChange={(e) => {
                    const sec = Number(e.target.value);
                    setAutoIntervalSeconds(sec);
                    setCountdown(sec);
                  }}
                  disabled={isAutoSending}
                  className="bg-[#0A1128] border border-amber-500/30 text-amber-200 text-xs font-semibold rounded-xl px-2.5 py-2 focus:outline-none focus:border-amber-400"
                >
                  <option value={2}>2 Sec / lead</option>
                  <option value={3}>3 Sec / lead</option>
                  <option value={5}>5 Sec / lead</option>
                  <option value={8}>8 Sec / lead</option>
                </select>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300">
                  Batch Progress: <span className="text-amber-400">{sentCount}</span> Sent /{" "}
                  <span className="text-slate-400">{skippedCount}</span> Skipped of {totalCount} Total
                </span>
                <span className="text-amber-300">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Control Bar Actions */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                {!isAutoSending ? (
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={currentIndex >= totalCount}
                    onClick={handleStartAutoSend}
                    className="bg-amber-400 hover:bg-amber-300 text-[#0A1128] font-bold text-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-[#0A1128]" /> Start Auto-Send (1-by-1)
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsAutoSending(false)}
                    className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs font-bold"
                  >
                    <Pause className="w-3.5 h-3.5 text-amber-400" /> Pause Queue ({countdown}s)
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="primary"
                  disabled={currentIndex >= totalCount}
                  onClick={triggerSendCurrent}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  <Send className="w-3.5 h-3.5 mr-1" /> Send Now & Next
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={currentIndex >= totalCount}
                  onClick={handleSkipCurrent}
                  className="text-xs text-slate-400 hover:text-amber-300"
                >
                  <SkipForward className="w-3.5 h-3.5 mr-1" /> Skip Lead
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleResetQueue}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset Queue
                </Button>
              </div>
            </div>
          </div>

          {/* Current Lead Highlight Banner */}
          {currentIndex < totalCount && currentItem ? (
            <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-[#0A1128] text-[10px] font-extrabold">
                    Lead #{currentIndex + 1} of {totalCount}
                  </span>
                  <h3 className="text-sm font-bold text-white">{currentItem.business.name}</h3>
                </div>
                <div className="text-xs text-slate-300 flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span>📞 {currentItem.business.phone || "No Phone"}</span>
                    <button
                      onClick={() => handleStartEditPhone(currentIndex, currentItem.business.phone)}
                      className="p-0.5 text-amber-400 hover:text-amber-300 transition-colors"
                      title="Edit Phone Number"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                  <span>📍 {currentItem.business.city}</span>
                  <span>⭐ {currentItem.business.rating || 5.0}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isAutoSending && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold animate-pulse">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Opening in {countdown}s...
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center bg-emerald-500/10 border-b border-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">Batch Outreach Completed!</h3>
              <p className="text-xs text-slate-300 mt-1">
                Processed {sentCount} leads successfully and skipped {skippedCount} leads.
              </p>
            </div>
          )}

          {/* Scrollable Queue List */}
          <div className="p-4 flex-1 overflow-y-auto space-y-2.5">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">
              Queue Lead List ({queue.length})
            </h4>

            {queue.map((item, idx) => {
              const isCurrent = idx === currentIndex;
              return (
                <div
                  key={item.business.id || idx}
                  className={`p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? "bg-amber-500/15 border-amber-400/50 shadow-md gold-glow"
                      : item.status === "sent"
                      ? "bg-emerald-950/20 border-emerald-500/30 opacity-75"
                      : item.status === "skipped"
                      ? "bg-slate-900/40 border-slate-800 opacity-50"
                      : "bg-[#0F1A3A]/60 border-slate-800 hover:border-amber-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <h5 className="text-xs font-bold text-white flex items-center gap-2">
                          {item.business.name}
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400 text-[#0A1128] font-bold">
                              Current Active
                            </span>
                          )}
                        </h5>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          {editingIdx === idx ? (
                            <div className="flex items-center gap-1 my-0.5">
                              <input
                                type="text"
                                value={editPhoneValue}
                                onChange={(e) => setEditPhoneValue(e.target.value)}
                                placeholder="+91 9876543210"
                                className="px-2 py-0.5 bg-[#0A1128] border border-amber-400 rounded text-xs text-amber-200 outline-none w-36 font-mono"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSavePhoneEdit(idx)}
                                className="p-1 rounded bg-amber-400 text-[#0A1128] font-bold hover:bg-amber-300 transition-colors"
                                title="Save Phone Number"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span>📞 {item.business.phone || "No Phone"}</span>
                              <button
                                onClick={() => handleStartEditPhone(idx, item.business.phone)}
                                className="p-0.5 text-amber-400/80 hover:text-amber-300 transition-colors"
                                title="Edit Phone Number"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <span>• {item.business.city}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === "sent" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Opened
                        </span>
                      ) : item.status === "skipped" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700">
                          Skipped
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
                          Pending
                        </span>
                      )}

                      <button
                        onClick={() => {
                          setCurrentIndex(idx);
                          triggerSendCurrent();
                        }}
                        className="p-1.5 text-slate-400 hover:text-amber-300 transition-colors"
                        title="Send Single WhatsApp Message"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Message Preview Box */}
                  <div className="mt-2 p-2 bg-[#0A1128] rounded-lg border border-slate-800 text-[11px] text-slate-300 font-sans italic">
                    "{item.messageText}"
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Close */}
          <div className="p-4 bg-[#0F1A3A] border-t border-amber-500/20 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              1-Click Sequential WhatsApp Auto-Dispatcher
            </span>
            <Button
              variant="secondary"
              onClick={() => {
                setIsAutoSending(false);
                onClose();
              }}
              className="text-xs"
            >
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
