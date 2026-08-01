"use client";

import React, { useState } from "react";
import { Business } from "@/lib/types";
import { copyToClipboard } from "@/lib/utils";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { WhatsAppActionButton } from "@/components/crm/whatsapp-action-button";
import {
  Star, Globe, Phone, Mail, MapPin, ExternalLink, Check, Copy, Heart,
  Download, Layers, Tag, Trash2, ChevronLeft, ChevronRight, Eye, Sparkles, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

import { BulkWhatsAppModal } from "@/components/crm/bulk-whatsapp-modal";

interface LeadTableProps {
  businesses: Business[];
  totalResults: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSaveLead: (business: Business) => void;
  onOpenDetails: (business: Business) => void;
  onBulkExport?: (selectedIds: number[]) => void;
  onBulkStatus?: (selectedIds: number[], status: string) => void;
  savedBusinessIds?: number[];
  isLoading?: boolean;
}

export function LeadTable({
  businesses,
  totalResults,
  currentPage,
  pageSize,
  hasNext,
  onPageChange,
  onPageSizeChange,
  onSaveLead,
  onOpenDetails,
  onBulkExport,
  onBulkStatus,
  savedBusinessIds = [],
  isLoading = false,
}: LeadTableProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [bulkWaModalOpen, setBulkWaModalOpen] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(businesses.map((b) => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const triggerCopy = (text: string | null, label: string) => {
    if (!text) return;
    copyToClipboard(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copySelectedPhones = () => {
    const phones = businesses
      .filter((b) => selectedIds.includes(b.id) && b.phone)
      .map((b) => b.phone)
      .join("\n");
    triggerCopy(phones, "All Selected Phones");
  };

  const copySelectedWebsites = () => {
    const websites = businesses
      .filter((b) => selectedIds.includes(b.id) && b.website)
      .map((b) => b.website)
      .join("\n");
    triggerCopy(websites, "All Selected Websites");
  };

  const copySelectedAddresses = () => {
    const addresses = businesses
      .filter((b) => selectedIds.includes(b.id) && b.address)
      .map((b) => `${b.name}: ${b.address}`)
      .join("\n");
    triggerCopy(addresses, "All Selected Addresses");
  };

  const selectedBusinesses = businesses.filter((b) => selectedIds.includes(b.id));

  const handleBulkWhatsApp = () => {
    if (selectedBusinesses.length === 0) {
      triggerCopy(null, "No valid phone numbers in selected leads");
      return;
    }
    setBulkWaModalOpen(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 my-6">
      {/* Floating Notification Toast for Copy actions */}
      <AnimatePresence>
        {copiedField && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-[#0F1A3A] text-amber-300 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-amber-500/40 text-xs font-semibold"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            Copied {copiedField} to Clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3.5 bg-[#0A1128]/95 border border-amber-500/40 backdrop-blur-md rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-2xl gold-glow"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-[#0A1128] text-xs font-bold flex items-center justify-center">
                {selectedIds.length}
              </span>
              <span className="text-xs font-semibold text-amber-200">Leads Selected</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={handleBulkWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-1"
                title="Send WhatsApp Message to Selected"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1 text-white" /> WhatsApp Selected
              </Button>

              <Button size="sm" variant="secondary" onClick={copySelectedPhones} className="text-xs py-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> Copy Phones
              </Button>

              <Button size="sm" variant="secondary" onClick={copySelectedWebsites} className="text-xs py-1">
                <Globe className="w-3.5 h-3.5 text-cyan-400" /> Copy Websites
              </Button>

              <Button size="sm" variant="secondary" onClick={copySelectedAddresses} className="text-xs py-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" /> Copy Addresses
              </Button>

              {onBulkExport && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onBulkExport(selectedIds)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-xs py-1"
                >
                  <Download className="w-3.5 h-3.5" /> Export Selected
                </Button>
              )}

              {onBulkStatus && (
                <select
                  onChange={(e) => {
                    if (e.target.value) onBulkStatus(selectedIds, e.target.value);
                  }}
                  defaultValue=""
                  className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none cursor-pointer"
                >
                  <option value="" disabled>Change Status...</option>
                  <option value="New">Set New</option>
                  <option value="Contacted">Set Contacted</option>
                  <option value="Interested">Set Interested</option>
                  <option value="Not Interested">Set Not Interested</option>
                  <option value="Closed">Set Closed</option>
                </select>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Glass Table Container */}
      <div className="glass-card rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={businesses.length > 0 && selectedIds.length === businesses.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 border-slate-700 bg-slate-900 cursor-pointer"
                  />
                </th>
                <th className="p-3.5 min-w-[200px]">Business Name</th>
                <th className="p-3.5 min-w-[170px]">Phone / WhatsApp</th>
                <th className="p-3.5 min-w-[150px]">Website</th>
                <th className="p-3.5 min-w-[160px]">Email</th>
                <th className="p-3.5 min-w-[220px]">Address</th>
                <th className="p-3.5 min-w-[120px]">Rating</th>
                <th className="p-3.5 min-w-[110px]">Category</th>
                <th className="p-3.5 min-w-[90px]">Status</th>
                <th className="p-3.5 min-w-[90px]">AI Score</th>
                <th className="p-3.5 min-w-[120px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="p-3.5"><div className="w-4 h-4 rounded bg-slate-800" /></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-800 rounded w-36" /></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-800 rounded w-24" /></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-800 rounded w-28" /></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-800 rounded w-32" /></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-800 rounded w-44" /></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-800 rounded w-16" /></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-800 rounded w-20" /></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-800 rounded w-14" /></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-800 rounded w-12" /></td>
                    <td className="p-3.5 text-right"><div className="h-4 bg-slate-800 rounded w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : businesses.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-slate-400">
                    <div className="max-w-sm mx-auto flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-slate-300">No Business Leads Found</p>
                      <p className="text-xs text-slate-500">Try searching for a different keyword or location like "Dentists in Delhi" or "Restaurants in Mumbai".</p>
                    </div>
                  </td>
                </tr>
              ) : (
                businesses.map((biz) => {
                  const isSelected = selectedIds.includes(biz.id);
                  const isSaved = savedBusinessIds.includes(biz.id);

                  return (
                    <tr
                      key={biz.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? "bg-indigo-950/20" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(biz.id)}
                          className="w-4 h-4 rounded text-indigo-600 border-slate-700 bg-slate-900 cursor-pointer"
                        />
                      </td>

                      {/* Business Name */}
                      <td className="p-3.5 font-semibold text-white">
                        <div className="flex flex-col">
                          <button
                            onClick={() => onOpenDetails(biz)}
                            className="text-left hover:text-indigo-400 font-bold transition-colors line-clamp-1"
                          >
                            {biz.name}
                          </button>
                          <span className="text-[11px] text-slate-400 font-normal">
                            {biz.city}, {biz.state}
                          </span>
                        </div>
                      </td>

                      {/* Phone & WhatsApp Action with 4-Message Selector */}
                      <td className="p-3.5">
                        {biz.phone ? (
                          <div className="flex items-center gap-1.5 group">
                            <span className="text-xs font-mono text-slate-300">{biz.phone}</span>

                            {/* Copy Phone */}
                            <button
                              onClick={() => triggerCopy(biz.phone, biz.name + " Phone")}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-opacity"
                              title="Copy Phone"
                            >
                              <Copy className="w-3 h-3" />
                            </button>

                            {/* WhatsApp Action Button with 4-message popover */}
                            <WhatsAppActionButton phone={biz.phone} business={biz} variant="badge" />
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs italic">N/A</span>
                        )}
                      </td>

                      {/* Website */}
                      <td className="p-3.5">
                        {biz.website ? (
                          <div className="flex items-center gap-1.5 max-w-[150px] truncate">
                            <a
                              href={biz.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-indigo-400 hover:underline flex items-center gap-1 truncate"
                            >
                              <Globe className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{biz.website.replace("https://", "").replace("www.", "")}</span>
                            </a>
                            <button
                              onClick={() => triggerCopy(biz.website, biz.name + " Website")}
                              className="p-1 text-slate-500 hover:text-slate-200"
                              title="Copy Website"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs italic">No Website</span>
                        )}
                      </td>

                      {/* Email */}
                      <td className="p-3.5">
                        {biz.email ? (
                          <div className="flex items-center gap-1.5 max-w-[160px] truncate">
                            <span className="text-xs text-purple-300 font-mono truncate">{biz.email}</span>
                            <button
                              onClick={() => triggerCopy(biz.email, biz.name + " Email")}
                              className="p-1 text-slate-500 hover:text-slate-200"
                              title="Copy Email"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs italic">N/A</span>
                        )}
                      </td>

                      {/* Address */}
                      <td className="p-3.5">
                        <div className="flex items-start gap-1 max-w-[220px]">
                          <span className="text-xs text-slate-400 line-clamp-2">{biz.address || "N/A"}</span>
                          {biz.google_maps_url && (
                            <a
                              href={biz.google_maps_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-indigo-400 hover:text-indigo-300 flex-shrink-0"
                              title="Google Maps"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {biz.rating}
                          </span>
                          <span className="text-[11px] text-slate-400">({biz.reviews_count})</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        <Badge variant="cyan" className="text-[10px]">
                          {biz.category || "Business"}
                        </Badge>
                      </td>

                      {/* Open Status */}
                      <td className="p-3.5">
                        {biz.open_now ? (
                          <Badge variant="emerald" className="text-[10px]">Open</Badge>
                        ) : (
                          <Badge variant="slate" className="text-[10px]">Closed</Badge>
                        )}
                      </td>

                      {/* AI Score */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1 font-bold text-xs">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${
                            biz.ai_score >= 85 ? "bg-emerald-600" : biz.ai_score >= 70 ? "bg-indigo-600" : "bg-amber-600"
                          }`}>
                            {biz.ai_score}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {biz.phone && (
                            <WhatsAppActionButton phone={biz.phone} business={biz} variant="icon" />
                          )}

                          <Button
                            size="sm"
                            variant={isSaved ? "primary" : "secondary"}
                            onClick={() => onSaveLead(biz)}
                            className={`py-1 px-2 text-xs ${
                              isSaved ? "bg-emerald-600 hover:bg-emerald-500" : ""
                            }`}
                            title={isSaved ? "Saved to CRM" : "Save Lead"}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-white" : ""}`} />
                            {isSaved ? "Saved" : "Save"}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onOpenDetails(biz)}
                            className="py-1 px-1.5 text-slate-400 hover:text-white"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>



        {/* Footer Pagination Bar */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <div>
              Showing Page <span className="font-bold text-white">{currentPage}</span> — Total{" "}
              <span className="font-bold text-amber-400">{totalResults}</span> Businesses
            </div>

            {onPageSizeChange && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="bg-[#0A1128] border border-amber-500/30 text-amber-200 font-semibold rounded-lg px-2 py-1 focus:outline-none focus:border-amber-400"
                >
                  <option value={20}>20 leads / page</option>
                  <option value={50}>50 leads / page</option>
                  <option value={100}>100 leads / page</option>
                  <option value={250}>250 leads / page</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => onPageChange(currentPage - 1)}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>

            <span className="px-3 py-1.5 bg-slate-800 rounded-lg text-white font-semibold text-xs">
              Page {currentPage}
            </span>

            <Button
              size="sm"
              variant="outline"
              disabled={!hasNext || isLoading}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 1-Click WhatsApp Sequencer Modal */}
      <BulkWhatsAppModal
        isOpen={bulkWaModalOpen}
        onClose={() => setBulkWaModalOpen(false)}
        businesses={selectedBusinesses}
      />
    </div>
  );
}
