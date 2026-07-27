"use client";

import React from "react";
import { X, Star, Globe, Phone, Mail, Clock, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export interface FilterState {
  minRating: number;
  hasWebsite: boolean;
  hasPhone: boolean;
  hasEmail: boolean;
  openNow: boolean;
  category: string;
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (newFilters: FilterState) => void;
  onResetFilters: () => void;
}

export function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}: FilterDrawerProps) {
  const [localFilters, setLocalFilters] = React.useState<FilterState>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Lead Filters</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Controls */}
            <div className="py-6 space-y-6">
              {/* Minimum Rating */}
              <div>
                <label className="text-sm font-semibold text-slate-200 flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Minimum Rating
                  </span>
                  <span className="text-indigo-400 font-bold">{localFilters.minRating} Stars</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[0, 3.5, 4.0, 4.5, 4.8].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setLocalFilters({ ...localFilters, minRating: val })}
                      className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                        localFilters.minRating === val
                          ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      {val === 0 ? "Any" : `${val}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Requirements Toggles */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-200 block">Lead Qualifications</label>

                {/* Has Website */}
                <label className="flex items-center justify-between p-3 bg-slate-800/60 border border-slate-700/80 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                  <span className="flex items-center gap-2.5 text-xs font-medium text-slate-200">
                    <Globe className="w-4 h-4 text-cyan-400" /> Must Have Website
                  </span>
                  <input
                    type="checkbox"
                    checked={localFilters.hasWebsite}
                    onChange={(e) => setLocalFilters({ ...localFilters, hasWebsite: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 border-slate-700 focus:ring-indigo-500 bg-slate-900"
                  />
                </label>

                {/* Has Phone */}
                <label className="flex items-center justify-between p-3 bg-slate-800/60 border border-slate-700/80 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                  <span className="flex items-center gap-2.5 text-xs font-medium text-slate-200">
                    <Phone className="w-4 h-4 text-emerald-400" /> Must Have Phone Number
                  </span>
                  <input
                    type="checkbox"
                    checked={localFilters.hasPhone}
                    onChange={(e) => setLocalFilters({ ...localFilters, hasPhone: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 border-slate-700 focus:ring-indigo-500 bg-slate-900"
                  />
                </label>

                {/* Has Email */}
                <label className="flex items-center justify-between p-3 bg-slate-800/60 border border-slate-700/80 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                  <span className="flex items-center gap-2.5 text-xs font-medium text-slate-200">
                    <Mail className="w-4 h-4 text-purple-400" /> Must Have Direct Email
                  </span>
                  <input
                    type="checkbox"
                    checked={localFilters.hasEmail}
                    onChange={(e) => setLocalFilters({ ...localFilters, hasEmail: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 border-slate-700 focus:ring-indigo-500 bg-slate-900"
                  />
                </label>

                {/* Open Now */}
                <label className="flex items-center justify-between p-3 bg-slate-800/60 border border-slate-700/80 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                  <span className="flex items-center gap-2.5 text-xs font-medium text-slate-200">
                    <Clock className="w-4 h-4 text-amber-400" /> Currently Open Now
                  </span>
                  <input
                    type="checkbox"
                    checked={localFilters.openNow}
                    onChange={(e) => setLocalFilters({ ...localFilters, openNow: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 border-slate-700 focus:ring-indigo-500 bg-slate-900"
                  />
                </label>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-sm font-semibold text-slate-200 block mb-2">Category Filter</label>
                <select
                  value={localFilters.category}
                  onChange={(e) => setLocalFilters({ ...localFilters, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
                >
                  <option value="">All Categories</option>
                  <option value="Dentist">Dentist / Dental Clinic</option>
                  <option value="Restaurant">Restaurant & Bistro</option>
                  <option value="Real Estate">Real Estate & Property</option>
                  <option value="Lawyer">Lawyer & Legal Firm</option>
                  <option value="Gym">Gym & Fitness Center</option>
                  <option value="Healthcare">Healthcare & Hospitals</option>
                  <option value="IT Services">IT & Software Agencies</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                onResetFilters();
                onClose();
              }}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onApplyFilters(localFilters);
                onClose();
              }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500"
            >
              Apply Filters
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
