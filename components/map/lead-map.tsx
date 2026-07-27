"use client";

import React, { useEffect, useState } from "react";
import { Business } from "@/lib/types";
import { MapPin, Phone, Globe, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LeadMapProps {
  businesses: Business[];
  centerLat?: number;
  centerLng?: number;
  onSelectBusiness?: (biz: Business) => void;
}

export function LeadMap({ businesses, centerLat = 28.6139, centerLng = 77.2090, onSelectBusiness }: LeadMapProps) {
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(businesses[0] || null);

  useEffect(() => {
    if (businesses.length > 0) {
      setSelectedBiz(businesses[0]);
    }
  }, [businesses]);

  return (
    <div className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden glass-card border border-slate-800 relative flex flex-col md:flex-row">
      {/* Visual Interactive Map Canvas Container */}
      <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center p-6">
        {/* Dark Map Mock Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

        {/* Floating Custom Map Pins */}
        <div className="relative w-full h-full min-h-[400px]">
          {businesses.map((b, idx) => {
            const isSelected = selectedBiz?.id === b.id;
            // Spread out markers deterministically visually
            const topPct = 20 + ((idx * 17) % 65);
            const leftPct = 15 + ((idx * 23) % 70);

            return (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedBiz(b);
                  if (onSelectBusiness) onSelectBusiness(b);
                }}
                style={{ top: `${topPct}%`, left: `${leftPct}%` }}
                className={`absolute transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 group z-10 ${
                  isSelected ? "scale-125 z-30" : "hover:scale-110"
                }`}
              >
                <div className={`p-2 rounded-full shadow-xl border flex items-center justify-center ${
                  isSelected
                    ? "bg-indigo-600 border-white text-white ring-4 ring-indigo-500/40"
                    : "bg-slate-900 border-indigo-500/50 text-indigo-400 hover:bg-indigo-600 hover:text-white"
                }`}>
                  <MapPin className="w-5 h-5 fill-current" />
                </div>

                {/* Marker Tooltip Label */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-900 border border-slate-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap pointer-events-none z-40">
                  {b.name} ({b.rating}★)
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Map Stats Overlay */}
        <div className="absolute bottom-4 left-4 z-20 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 shadow-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Interactive Pin Radius Map — {businesses.length} Businesses Plotted
        </div>
      </div>

      {/* Selected Business Sidebar Drawer */}
      {selectedBiz && (
        <div className="w-full md:w-80 bg-slate-900/95 border-t md:border-t-0 md:border-l border-slate-800 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="indigo">{selectedBiz.category || "Business"}</Badge>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {selectedBiz.rating} ({selectedBiz.reviews_count})
              </div>
            </div>

            <h3 className="text-base font-bold text-white">{selectedBiz.name}</h3>

            <p className="text-xs text-slate-400 flex items-start gap-1.5 leading-relaxed">
              <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              {selectedBiz.address}
            </p>

            <div className="pt-2 space-y-2 text-xs border-t border-slate-800">
              {selectedBiz.phone && (
                <div className="flex items-center gap-2 text-slate-300 font-mono">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {selectedBiz.phone}
                </div>
              )}
              {selectedBiz.website && (
                <div className="flex items-center gap-2 text-indigo-400 truncate">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <a href={selectedBiz.website} target="_blank" rel="noreferrer" className="underline truncate">
                    {selectedBiz.website.replace("https://", "")}
                  </a>
                </div>
              )}
            </div>
          </div>

          {selectedBiz.google_maps_url && (
            <a
              href={selectedBiz.google_maps_url}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              Open in Google Maps
            </a>
          )}
        </div>
      )}
    </div>
  );
}
