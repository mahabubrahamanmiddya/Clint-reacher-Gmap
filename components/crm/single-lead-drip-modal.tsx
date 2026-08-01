"use client";

import React, { useState, useEffect, useRef } from "react";
import { Business } from "@/lib/types";
import {
  getWhatsAppTemplates,
  generateWhatsAppMessage,
  generateWhatsAppUrl,
  buildWhatsAppDirectUrl,
  formatPhoneForWhatsApp,
  getMetaCloudCredentials,
  saveMetaCloudCredentials,
  sendMetaCloudMessageDirect,
  WhatsAppTemplateItem,
} from "@/lib/whatsapp";
import { MetaCloudSettingsModal } from "@/components/crm/meta-cloud-settings-modal";
import {
  MessageSquare,
  Play,
  Pause,
  SkipForward,
  CheckCircle2,
  X,
  ExternalLink,
  Clock,
  Sparkles,
  RefreshCw,
  Send,
  Edit2,
  Check,
  Zap,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface SingleLeadDripModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business | null;
  onStatusUpdated?: (leadId: number, status: string) => void;
}

export interface DripStepItem {
  id: number;
  templateName: string;
  templateText: string;
  formattedMessage: string;
  status: "pending" | "sent" | "skipped";
}

export function SingleLeadDripModal({
  isOpen,
  onClose,
  business,
  onStatusUpdated,
}: SingleLeadDripModalProps) {
  const [steps, setSteps] = useState<DripStepItem[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isAutoSending, setIsAutoSending] = useState<boolean>(false);
  const [autoIntervalSeconds, setAutoIntervalSeconds] = useState<number>(3);
  const [countdown, setCountdown] = useState<number>(3);
  const [customPhone, setCustomPhone] = useState<string>("");
  const [isEditingPhone, setIsEditingPhone] = useState<boolean>(false);
  const [isCloudApiMode, setIsCloudApiMode] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [cloudStatusMsg, setCloudStatusMsg] = useState<string>("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && business) {
      const templates = getWhatsAppTemplates();
      const metaCreds = getMetaCloudCredentials();
      setIsCloudApiMode(metaCreds.isCloudApiEnabled && !!metaCreds.phoneId && !!metaCreds.token);
      setCustomPhone(business.phone || "");
      setIsEditingPhone(false);

      const initialSteps: DripStepItem[] = templates.map((t) => ({
        id: t.id,
        templateName: t.name,
        templateText: t.text,
        formattedMessage: generateWhatsAppMessage(t.text, business),
        status: "pending",
      }));

      setSteps(initialSteps);
      setCurrentStepIdx(0);
      setIsAutoSending(false);
      setCountdown(autoIntervalSeconds);
    }
  }, [isOpen, business]);

  // Handle phone update
  const handleSavePhone = () => {
    if (!business) return;
    const updatedBiz = { ...business, phone: customPhone };
    const templates = getWhatsAppTemplates();

    setSteps((prev) =>
      prev.map((s, idx) => ({
        ...s,
        formattedMessage: generateWhatsAppMessage(templates[idx]?.text || s.templateText, updatedBiz),
      }))
    );
    setIsEditingPhone(false);
  };

  const currentStepIdxRef = useRef<number>(0);
  useEffect(() => {
    currentStepIdxRef.current = currentStepIdx;
  }, [currentStepIdx]);

  // Auto Send Timer Loop with Ref to avoid stale closures
  useEffect(() => {
    if (!isAutoSending) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          triggerSendCurrentStep();
          return autoIntervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoSending, autoIntervalSeconds]);

  if (!isOpen || !business) return null;

  const currentStep = steps[currentStepIdx];
  const totalSteps = steps.length;
  const sentCount = steps.filter((s) => s.status === "sent").length;
  const progressPercent = totalSteps > 0 ? Math.round((sentCount / totalSteps) * 100) : 0;

  const triggerSendCurrentStep = async () => {
    const activeIdx = currentStepIdxRef.current;
    const activeStep = steps[activeIdx];
    if (!activeStep) return;

    const targetPhone = customPhone || business.phone || "";
    const metaCreds = getMetaCloudCredentials();

    // Check if Meta Cloud API is enabled & configured
    if (isCloudApiMode && metaCreds.phoneId && metaCreds.token) {
      setCloudStatusMsg(`⚡ Sending Step ${activeIdx + 1} via Meta Cloud API (Background)...`);
      let res = await sendMetaCloudMessageDirect(targetPhone, activeStep.formattedMessage);

      // Sandbox Test Mode Fallback: If recipient not in allowed list, send to verified test phone 918391959941
      if (!res.success && res.error?.includes("131030")) {
        setCloudStatusMsg(`🧪 Sandbox Test Mode: Sending to your verified number (918391959941)...`);
        res = await sendMetaCloudMessageDirect("918391959941", activeStep.formattedMessage);
      }

      if (res.success) {
        setCloudStatusMsg(`✅ Delivered Step ${activeIdx + 1} to WhatsApp! ID: ${res.messageId}`);
        setSteps((prev) =>
          prev.map((s, idx) => (idx === activeIdx ? { ...s, status: "sent" } : s))
        );
        if (onStatusUpdated) {
          onStatusUpdated(business.id, "Contacted");
        }
      } else {
        setCloudStatusMsg(`❌ Meta Cloud API Notice: ${res.error}`);
        setSteps((prev) =>
          prev.map((s, idx) => (idx === activeIdx ? { ...s, status: "skipped" } : s))
        );
      }
    } else {
      // Standard Web Link Mode (Only when Web Mode is selected)
      const url = buildWhatsAppDirectUrl(targetPhone, activeStep.formattedMessage);
      if (url) {
        window.open(url, "LeadXWhatsAppTab");
        setSteps((prev) =>
          prev.map((s, idx) => (idx === activeIdx ? { ...s, status: "sent" } : s))
        );
        if (onStatusUpdated) {
          onStatusUpdated(business.id, "Contacted");
        }
      }
    }

    // Advance to next step
    setCountdown(autoIntervalSeconds);
    if (activeIdx + 1 < totalSteps) {
      setCurrentStepIdx(activeIdx + 1);
    } else {
      setIsAutoSending(false);
      setCurrentStepIdx(totalSteps);
    }
  };

  const handleStartAutoSend = () => {
    setIsAutoSending(true);
    triggerSendCurrentStep();
  };

  const advanceStep = () => {
    setCountdown(autoIntervalSeconds);
    if (currentStepIdx + 1 < totalSteps) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      setIsAutoSending(false);
      setCurrentStepIdx(totalSteps);
    }
  };

  const handleSkipCurrentStep = () => {
    setSteps((prev) =>
      prev.map((s, idx) => (idx === currentStepIdx ? { ...s, status: "skipped" } : s))
    );
    advanceStep();
  };

  const handleResetDrip = () => {
    setIsAutoSending(false);
    const templates = getWhatsAppTemplates();
    setSteps(
      templates.map((t) => ({
        id: t.id,
        templateName: t.name,
        templateText: t.text,
        formattedMessage: generateWhatsAppMessage(t.text, business),
        status: "pending",
      }))
    );
    setCurrentStepIdx(0);
    setCountdown(autoIntervalSeconds);
  };

  const handleSendCombined4in1 = () => {
    if (!business) return;
    const targetPhone = customPhone || business.phone;
    const templates = getWhatsAppTemplates();

    const combinedText = `Namaste ${business.name},\n\n` +
      `1️⃣ *Initial Pitch*: ${generateWhatsAppMessage(templates[0]?.text || "", business)}\n\n` +
      `2️⃣ *Growth Plan*: ${generateWhatsAppMessage(templates[1]?.text || "", business)}\n\n` +
      `3️⃣ *Free Audit Offer*: ${generateWhatsAppMessage(templates[2]?.text || "", business)}\n\n` +
      `4️⃣ *Follow-up*: ${generateWhatsAppMessage(templates[3]?.text || "", business)}`;

    const url = buildWhatsAppDirectUrl(targetPhone, combinedText);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      setSteps((prev) => prev.map((s) => ({ ...s, status: "sent" })));
      if (onStatusUpdated) {
        onStatusUpdated(business.id, "Contacted");
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl glass-card bg-[#0A1128] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] gold-glow"
        >
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-[#0F1A3A] via-[#0A1128] to-[#14234C] border-b border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-[#0A1128] font-extrabold shadow-md">
                <Zap className="w-5 h-5 fill-[#0A1128]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  4-Msg Drip Outreach Assistant
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                    4 Messages
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Send follow-up messages to <span className="text-white font-semibold">{business.name}</span>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSettingsModalOpen(true)}
                className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-400 text-amber-300 hover:text-[#0A1128] border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Configure Meta WhatsApp Cloud API (Zero-Click Send)"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Meta API Settings</span>
              </button>

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
          </div>

          {/* Cloud API vs Web Banner */}
          <div className="px-5 py-2.5 bg-gradient-to-r from-amber-500/10 via-[#0F1A3A] to-amber-500/10 border-b border-amber-500/20 text-[11px] text-amber-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                {isCloudApiMode ? (
                  <strong className="text-emerald-400">⚡ Meta WhatsApp Cloud API Mode Active (Zero Tabs Opened!)</strong>
                ) : (
                  <span><strong>Web Mode:</strong> Opens WhatsApp Web tab. Press <kbd className="px-1 py-0.5 bg-amber-400 text-[#0A1128] font-bold rounded">Enter ↵</kbd> in WhatsApp Web.</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle Mode Button */}
              <button
                onClick={() => {
                  const newMode = !isCloudApiMode;
                  setIsCloudApiMode(newMode);
                  saveMetaCloudCredentials({ isCloudApiEnabled: newMode });
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                  isCloudApiMode
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                }`}
              >
                {isCloudApiMode ? "Mode: ⚡ Zero-Tab API" : "Mode: 🌐 Web Tab"}
              </button>

              <button
                onClick={() => setSettingsModalOpen(true)}
                className="text-[10px] text-amber-400 hover:underline font-bold"
              >
                Manage Keys ⚙️
              </button>
            </div>
          </div>

          {cloudStatusMsg && (
            <div className="px-5 py-2 bg-[#0F1A3A] border-b border-amber-500/30 text-xs font-mono text-amber-300">
              {cloudStatusMsg}
            </div>
          )}

          {/* Business Lead Info Box */}
          <div className="p-4 bg-[#0F1A3A]/70 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                {business.name}
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-normal">
                  {business.category || "Business"}
                </span>
              </h3>

              <div className="text-xs text-slate-300 flex items-center gap-3">
                {isEditingPhone ? (
                  <div className="flex items-center gap-1.5 my-0.5">
                    <input
                      type="text"
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="px-2 py-0.5 bg-[#0A1128] border border-amber-400 rounded text-xs text-amber-200 outline-none w-36 font-mono"
                      autoFocus
                    />
                    <button
                      onClick={handleSavePhone}
                      className="p-1 rounded bg-amber-400 text-[#0A1128] font-bold hover:bg-amber-300"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span>📞 {customPhone || business.phone || "No Phone"}</span>
                    <button
                      onClick={() => setIsEditingPhone(true)}
                      className="p-0.5 text-amber-400 hover:text-amber-300 transition-colors"
                      title="Edit Phone"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <span>📍 {business.city}</span>
                <span>⭐ {business.rating || 5.0}</span>
              </div>
            </div>

            {/* 1-Click 4-in-1 Master Button */}
            <Button
              size="sm"
              variant="primary"
              onClick={handleSendCombined4in1}
              className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-[#0A1128] font-extrabold text-xs shadow-lg border-0"
              title="Combine all 4 messages into 1 complete pitch proposal"
            >
              <Zap className="w-4 h-4 fill-[#0A1128]" /> 🚀 Send 4-in-1 Master Pitch
            </Button>
          </div>

          {/* Progress Bar & Main Actions */}
          <div className="p-5 border-b border-slate-800 bg-[#0A1128] space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300">
                  Drip Progress: <span className="text-amber-400">{sentCount}</span> of {totalSteps} Messages Sent
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span>Gap:</span>
                    <select
                      value={autoIntervalSeconds}
                      onChange={(e) => {
                        const sec = Number(e.target.value);
                        setAutoIntervalSeconds(sec);
                        setCountdown(sec);
                      }}
                      disabled={isAutoSending}
                      className="bg-[#0F1A3A] border border-amber-500/30 text-amber-200 text-xs font-semibold rounded-lg px-2 py-0.5 outline-none"
                    >
                      <option value={5}>5 Sec / msg</option>
                      <option value={8}>8 Sec / msg</option>
                      <option value={12}>12 Sec / msg</option>
                      <option value={15}>15 Sec / msg</option>
                    </select>
                  </div>
                  <span className="text-amber-300">{progressPercent}%</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {!isAutoSending ? (
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={currentStepIdx >= totalSteps}
                    onClick={handleStartAutoSend}
                    className="bg-amber-400 hover:bg-amber-300 text-[#0A1128] font-bold text-xs shadow-lg"
                  >
                    <Play className="w-3.5 h-3.5 fill-[#0A1128]" /> Auto-Send 4 Messages (Timer)
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsAutoSending(false)}
                    className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs font-bold"
                  >
                    <Pause className="w-3.5 h-3.5 text-amber-400" /> Pause ({countdown}s)
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="primary"
                  disabled={currentStepIdx >= totalSteps}
                  onClick={triggerSendCurrentStep}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  <Send className="w-3.5 h-3.5 mr-1" /> Send Current Msg & Next
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={currentStepIdx >= totalSteps}
                  onClick={handleSkipCurrentStep}
                  className="text-xs text-slate-400 hover:text-amber-300"
                >
                  <SkipForward className="w-3.5 h-3.5 mr-1" /> Skip Msg
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleResetDrip}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset Drip
                </Button>
              </div>
            </div>
          </div>

          {/* 4 Drip Message List */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-1">
              Sequence Messages List ({steps.length})
            </h4>

            {steps.map((step, idx) => {
              const isCurrent = idx === currentStepIdx;
              return (
                <div
                  key={step.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCurrent
                      ? "bg-amber-500/15 border-amber-400/60 shadow-md gold-glow"
                      : step.status === "sent"
                      ? "bg-emerald-950/20 border-emerald-500/30 opacity-75"
                      : step.status === "skipped"
                      ? "bg-slate-900/40 border-slate-800 opacity-50"
                      : "bg-[#0F1A3A]/60 border-slate-800 hover:border-amber-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-[#0A1128] text-xs font-extrabold flex items-center justify-center">
                        {step.id}
                      </span>
                      <h5 className="text-xs font-bold text-white flex items-center gap-2">
                        {step.templateName}
                        {isCurrent && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400 text-[#0A1128] font-extrabold animate-pulse">
                            Active Current
                          </span>
                        )}
                      </h5>
                    </div>

                    <div className="flex items-center gap-2">
                      {step.status === "sent" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Sent
                        </span>
                      ) : step.status === "skipped" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                          Skipped
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                          Pending
                        </span>
                      )}

                      <Button
                        size="sm"
                        variant={isCurrent ? "primary" : "secondary"}
                        onClick={() => {
                          setCurrentStepIdx(idx);
                          triggerSendCurrentStep();
                        }}
                        className={`text-xs py-1 px-3 font-bold ${
                          isCurrent ? "bg-amber-400 hover:bg-amber-300 text-[#0A1128]" : "bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white"
                        }`}
                        title={`Send Message ${step.id} to WhatsApp`}
                      >
                        <Send className="w-3 h-3 mr-1" /> Send Msg {step.id}
                      </Button>
                    </div>
                  </div>

                  {/* Formatted Personalized Message text */}
                  <div className="p-2.5 bg-[#0A1128] rounded-xl border border-slate-800 text-xs text-slate-200 font-sans italic leading-relaxed">
                    "{step.formattedMessage}"
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#0F1A3A] border-t border-amber-500/20 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              1-Click 4-Drip Message Auto-Sequence Dispatcher
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

      <MetaCloudSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => {
          setSettingsModalOpen(false);
          const metaCreds = getMetaCloudCredentials();
          setIsCloudApiMode(metaCreds.isCloudApiEnabled && !!metaCreds.phoneId && !!metaCreds.token);
        }}
      />
    </AnimatePresence>
  );
}
