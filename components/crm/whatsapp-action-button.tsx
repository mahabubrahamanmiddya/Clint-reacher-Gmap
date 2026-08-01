"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, ChevronDown, Send, Zap, Sparkles } from "lucide-react";
import { getWhatsAppTemplates, sendWhatsAppMessage, generateWhatsAppMessage, WhatsAppTemplateItem } from "@/lib/whatsapp";
import { Business } from "@/lib/types";
import { SingleLeadDripModal } from "@/components/crm/single-lead-drip-modal";

interface WhatsAppActionButtonProps {
  phone: string | null | undefined;
  business?: Partial<Business>;
  variant?: "badge" | "button" | "icon" | "large";
  className?: string;
}

export function WhatsAppActionButton({
  phone,
  business,
  variant = "button",
  className = "",
}: WhatsAppActionButtonProps) {
  const [open, setOpen] = useState(false);
  const [dripModalOpen, setDripModalOpen] = useState(false);
  const [templates, setTemplates] = useState<WhatsAppTemplateItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTemplates(getWhatsAppTemplates());
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!phone) return null;

  const handleOpenDripModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    setDripModalOpen(true);
  };

  const handleSendMaster4in1 = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    const templates = getWhatsAppTemplates();
    const biz = business || {};
    const name = biz.name || "Client";
    const combinedText = `Namaste ${name},\n\n` +
      `1️⃣ *Initial Pitch*: ${generateWhatsAppMessage(templates[0]?.text || "", biz)}\n\n` +
      `2️⃣ *Growth Plan*: ${generateWhatsAppMessage(templates[1]?.text || "", biz)}\n\n` +
      `3️⃣ *Free Audit Offer*: ${generateWhatsAppMessage(templates[2]?.text || "", biz)}\n\n` +
      `4️⃣ *Follow-up*: ${generateWhatsAppMessage(templates[3]?.text || "", biz)}`;

    const cleanPhone = phone?.replace(/\D/g, "");
    if (cleanPhone) {
      const url = `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(combinedText)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleSendTemplate = (templateId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sendWhatsAppMessage(phone, business, templateId);
    setOpen(false);
  };

  return (
    <>
      <div className="relative inline-block text-left" ref={containerRef}>
        <div className="inline-flex items-center rounded-lg shadow-sm">
          {variant === "icon" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(!open);
              }}
              className={`p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-400 text-amber-300 hover:text-[#0A1128] transition-all border border-amber-500/40 ${className}`}
              title="Send 4 Drip Messages to this business"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          ) : variant === "badge" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(!open);
              }}
              className={`p-1 px-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center gap-1 transition-all ${className}`}
              title="Auto 4-Drip Messages"
            >
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>4-Drip Msgs</span>
              <ChevronDown className="w-2.5 h-2.5 opacity-70" />
            </button>
          ) : variant === "large" ? (
            <button
              onClick={handleOpenDripModal}
              className={`w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-[#0A1128] rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md gold-glow ${className}`}
            >
              <Zap className="w-4 h-4 fill-[#0A1128]" />
              Auto-Send All 4 Drip Messages
            </button>
          ) : (
            /* Default "button" variant - Option 2 Drip Assistant */
            <button
              onClick={handleOpenDripModal}
              className={`py-1 px-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-[#0A1128] text-xs font-extrabold flex items-center gap-1.5 transition-all shadow ${className}`}
              title="Auto-Send 4 Separate Drip Messages (Step-by-Step)"
            >
              <Zap className="w-3.5 h-3.5 fill-[#0A1128]" />
              <span>Send 4 Drip Msgs</span>
              <ChevronDown className="w-3 h-3 text-[#0A1128]/80" />
            </button>
          )}
        </div>

        {/* Popover Menu with 4 Drip Sequence + Individual Templates */}
        {open && (
          <div className="absolute right-0 mt-1.5 w-72 rounded-2xl bg-[#0A1128] border border-amber-500/40 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 gold-glow">
            {/* Primary Option 2: Step-by-Step Drip Modal Button */}
            <button
              onClick={handleOpenDripModal}
              className="w-full mb-1.5 p-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-[#0A1128] font-extrabold text-xs flex items-center justify-between gap-2 shadow-md transition-all"
            >
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 fill-[#0A1128]" />
                <span>▶️ Auto-Send 4 Separate Messages</span>
              </div>
              <Send className="w-3.5 h-3.5" />
            </button>

            {/* Option 1: 4-in-1 Master Pitch Button */}
            <button
              onClick={handleSendMaster4in1}
              className="w-full mb-1.5 p-2 rounded-xl bg-[#0F1A3A] hover:bg-[#162752] text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-between gap-2 transition-all"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>🚀 Combine All into 1 Pitch</span>
              </div>
              <Send className="w-3.5 h-3.5" />
            </button>

            <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-t border-b border-slate-800 flex items-center justify-between my-1">
              <span>Or Pick 1 Specific Message:</span>
            </div>

            <div className="space-y-1">
              {templates.map((t) => {
                const formattedPreview = generateWhatsAppMessage(t.text, business);
                return (
                  <button
                    key={t.id}
                    onClick={(e) => handleSendTemplate(t.id, e)}
                    className="w-full text-left p-2 rounded-xl hover:bg-amber-500/10 hover:border-amber-500/30 border border-transparent transition-all group flex items-start gap-2"
                  >
                    <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-amber-400 group-hover:text-[#0A1128] transition-colors">
                      {t.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300 truncate">
                        {t.name}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">
                        {formattedPreview}
                      </div>
                    </div>
                    <Send className="w-3 h-3 text-slate-500 group-hover:text-amber-400 flex-shrink-0 self-center" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Single Business 4-Drip Sequence Modal */}
      {business && (
        <SingleLeadDripModal
          isOpen={dripModalOpen}
          onClose={() => setDripModalOpen(false)}
          business={business as Business}
        />
      )}
    </>
  );
}

