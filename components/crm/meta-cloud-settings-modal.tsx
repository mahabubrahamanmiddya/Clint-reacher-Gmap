"use client";

import React, { useState, useEffect } from "react";
import {
  getMetaCloudCredentials,
  saveMetaCloudCredentials,
  sendMetaCloudMessageDirect,
  MetaCloudCredentials,
} from "@/lib/whatsapp";
import {
  ShieldCheck,
  Zap,
  Key,
  Phone,
  CheckCircle2,
  X,
  Sparkles,
  ExternalLink,
  Info,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface MetaCloudSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MetaCloudSettingsModal({
  isOpen,
  onClose,
}: MetaCloudSettingsModalProps) {
  const [creds, setCreds] = useState<MetaCloudCredentials>({
    phoneId: "",
    token: "",
    accountId: "",
    isCloudApiEnabled: false,
  });
  const [testPhone, setTestPhone] = useState<string>("");
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const loaded = getMetaCloudCredentials();
      setCreds(loaded);
      setTestStatus(null);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveMetaCloudCredentials(creds);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestConnection = async () => {
    if (!creds.phoneId || !creds.token) {
      setTestStatus("❌ Please enter both Phone Number ID and Access Token.");
      return;
    }
    if (!testPhone) {
      setTestStatus("⚠️ Enter a test phone number (e.g. +91 9876543210).");
      return;
    }

    setIsTesting(true);
    setTestStatus("⏳ Sending test WhatsApp message via Meta Cloud API...");

    // Save transiently to test
    saveMetaCloudCredentials(creds);

    const res = await sendMetaCloudMessageDirect(
      testPhone,
      "⚡ LeadX Test Message: Your Meta WhatsApp Cloud API is connected & working 100%!"
    );

    setIsTesting(false);
    if (res.success) {
      setTestStatus(`✅ Success! WhatsApp message delivered! Message ID: ${res.messageId}`);
    } else {
      setTestStatus(`❌ Failed: ${res.error}`);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl glass-card bg-[#0A1128] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] gold-glow"
        >
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-[#0F1A3A] via-[#0A1128] to-[#14234C] border-b border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-[#0A1128] font-extrabold shadow-md">
                <Zap className="w-5 h-5 fill-[#0A1128]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Meta WhatsApp Cloud API Setup
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    1,000 Free / Mo
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Zero-Click Server Auto-Sending directly to client WhatsApp inbox.
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

          {/* Form Body */}
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            {/* Enable Mode Toggle */}
            <div className="p-4 rounded-xl bg-[#0F1A3A] border border-amber-500/30 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Enable Meta Cloud API Mode
                </h4>
                <p className="text-[11px] text-slate-400">
                  Bypasses browser tabs — sends messages in background automatically.
                </p>
              </div>

              <input
                type="checkbox"
                checked={creds.isCloudApiEnabled}
                onChange={(e) =>
                  setCreds({ ...creds, isCloudApiEnabled: e.target.checked })
                }
                className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
              />
            </div>

            {/* Field 1: Phone Number ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                Phone Number ID (Meta Developer Portal)
              </label>
              <input
                type="text"
                value={creds.phoneId}
                onChange={(e) => setCreds({ ...creds, phoneId: e.target.value })}
                placeholder="e.g. 104857294829104"
                className="w-full px-3.5 py-2.5 bg-[#0A1128] border border-slate-800 focus:border-amber-400 rounded-xl text-xs text-white outline-none font-mono"
              />
            </div>

            {/* Field 2: Permanent Access Token */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                Permanent System User Access Token
              </label>
              <textarea
                rows={3}
                value={creds.token}
                onChange={(e) => setCreds({ ...creds, token: e.target.value })}
                placeholder="Paste your EAAG... Access Token from Meta Developer Console"
                className="w-full px-3.5 py-2.5 bg-[#0A1128] border border-slate-800 focus:border-amber-400 rounded-xl text-xs text-white outline-none font-mono"
              />
            </div>

            {/* Test Connection Box */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-amber-400" />
                Test Meta Cloud Connection
              </h4>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="Your phone number (+91 9876543210)"
                  className="flex-1 px-3 py-2 bg-[#0A1128] border border-slate-700 rounded-xl text-xs text-white outline-none font-mono"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isTesting}
                  onClick={handleTestConnection}
                  className="text-xs bg-amber-500/20 text-amber-300 hover:bg-amber-400 hover:text-[#0A1128] border-amber-500/40"
                >
                  {isTesting ? "Testing..." : "Send Test Msg"}
                </Button>
              </div>

              {testStatus && (
                <div className="p-2.5 rounded-lg bg-[#0A1128] border border-slate-800 text-[11px] font-mono text-slate-300 leading-relaxed">
                  {testStatus}
                </div>
              )}
            </div>

            {/* Meta Guide Box */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1.5">
              <div className="flex items-center justify-between font-bold text-amber-300">
                <span className="flex items-center gap-1.5">
                  <Info className="w-4 h-4" /> How to get Meta API Keys (100% Free):
                </span>
                <a
                  href="https://developers.facebook.com/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] underline text-amber-400 hover:text-amber-300"
                >
                  developers.facebook.com <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-100/90 leading-relaxed">
                <li>Go to developers.facebook.com & Create a Business App.</li>
                <li>Add <strong>WhatsApp</strong> product to your App.</li>
                <li>Copy <strong>Phone Number ID</strong> & <strong>Access Token</strong> above.</li>
              </ol>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#0F1A3A] border-t border-amber-500/20 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {savedSuccess ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Credentials Saved!
                </span>
              ) : (
                "Meta WhatsApp Cloud API Configuration"
              )}
            </span>

            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={onClose} className="text-xs">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                className="bg-gradient-to-r from-amber-400 to-amber-500 text-[#0A1128] font-bold text-xs"
              >
                Save Meta Keys
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
