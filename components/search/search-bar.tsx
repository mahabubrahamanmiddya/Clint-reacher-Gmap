"use client";

import React, { useState } from "react";
import { Search, MapPin, SlidersHorizontal, Sparkles, Navigation, Hash, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchRequest } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

interface SearchBarProps {
  onSearch: (req: SearchRequest) => void;
  onOpenFilters: () => void;
  isLoading?: boolean;
  activeFilterCount?: number;
}

const PRESET_SEARCHES = [
  "Dentists in Delhi",
  "Restaurants in Mumbai",
  "Real Estate Agents in Bangalore",
  "Lawyers in Kolkata",
  "Gyms in Hyderabad",
];

export function SearchBar({ onSearch, onOpenFilters, isLoading, activeFilterCount = 0 }: SearchBarProps) {
  const [query, setQuery] = useState("Dentists in Delhi");
  const [city, setCity] = useState("Delhi");
  const [state, setState] = useState("");
  const [radius, setRadius] = useState<number | undefined>(undefined);
  const [pincode, setPincode] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    onSearch({
      query: query.trim(),
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      radius: radius,
      pincode: pincode.trim() || undefined,
      page: 1,
      page_size: 20,
    });
  };

  const handlePresetClick = (preset: string) => {
    setQuery(preset);
    // Auto detect city from preset text
    if (preset.toLowerCase().includes("delhi")) setCity("Delhi");
    else if (preset.toLowerCase().includes("mumbai")) setCity("Mumbai");
    else if (preset.toLowerCase().includes("bangalore")) setCity("Bangalore");
    else if (preset.toLowerCase().includes("kolkata")) setCity("Kolkata");
    else if (preset.toLowerCase().includes("hyderabad")) setCity("Hyderabad");
    
    onSearch({
      query: preset,
      city: preset.split(" in ")[1] || undefined,
      page: 1,
      page_size: 20,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-2xl relative gradient-glow"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Main Search Input Box */}
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-indigo-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search any business (e.g., Dentists in Delhi, Restaurants in Mumbai)..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 text-sm sm:text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="hidden sm:flex items-center gap-1.5 py-3 px-3.5 border-slate-700 hover:bg-slate-800 text-slate-300"
              title="Search Options"
            >
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="text-xs">Options</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={onOpenFilters}
              className="flex items-center gap-1.5 py-3 px-3.5 border-slate-700 hover:bg-slate-800 text-slate-300 relative"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline text-xs">Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center -mr-1">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="py-3.5 px-6 font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 border-0"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              Search
            </Button>
          </div>

          {/* Advanced Search Options Bar (City, State, Radius, Pincode) */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80"
              >
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-400" /> City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Delhi"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-indigo-400" /> State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1 flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-indigo-400" /> Radius (km)
                  </label>
                  <select
                    value={radius || ""}
                    onChange={(e) => setRadius(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-indigo-500 outline-none"
                  >
                    <option value="">Any Radius</option>
                    <option value="5">5 km</option>
                    <option value="10">10 km</option>
                    <option value="25">25 km</option>
                    <option value="50">50 km</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1 flex items-center gap-1">
                    <Hash className="w-3 h-3 text-indigo-400" /> Pincode
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 110001"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
              Popular Searches:
            </span>
            {PRESET_SEARCHES.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/80 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 border border-slate-700/60 hover:border-indigo-500/40 transition-all hover:scale-105"
              >
                {preset}
              </button>
            ))}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
