"use client";

import React, { useState, useEffect } from "react";
import { SearchBar } from "@/components/search/search-bar";
import { FilterDrawer, FilterState } from "@/components/search/filter-drawer";
import { LeadTable } from "@/components/data-table/lead-table";
import { LeadDetailsModal } from "@/components/crm/lead-details-modal";
import { ExportModal } from "@/components/crm/export-modal";
import { searchPlaces, saveLead, getSavedLeads } from "@/lib/api";
import { Business, SearchRequest } from "@/lib/types";
import { Sparkles, MapPin, Database, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [currentReq, setCurrentReq] = useState<SearchRequest>({
    query: "Dentists in Delhi",
    city: "Delhi",
    page: 1,
    page_size: 20,
  });

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    minRating: 0,
    hasWebsite: false,
    hasPhone: false,
    hasEmail: false,
    openNow: false,
    category: "",
  });

  const [savedLeadIds, setSavedLeadIds] = useState<number[]>([]);
  const [selectedDetailsBiz, setSelectedDetailsBiz] = useState<Business | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportIds, setExportIds] = useState<number[]>([]);

  // Initial search on mount
  useEffect(() => {
    handleExecuteSearch(currentReq);
    loadSavedLeadIds();
  }, []);

  const loadSavedLeadIds = async () => {
    const leads = await getSavedLeads();
    setSavedLeadIds(leads.map((l) => l.business_id));
  };

  const handleExecuteSearch = async (req: SearchRequest) => {
    setIsLoading(true);
    setCurrentReq(req);
    try {
      const resp = await searchPlaces({
        ...req,
        min_rating: filters.minRating,
        has_website: filters.hasWebsite,
        has_phone: filters.hasPhone,
        has_email: filters.hasEmail,
        open_now: filters.openNow,
        category: filters.category || undefined,
      });

      setBusinesses(resp.results);
      setTotalResults(resp.total);
      setCurrentPage(resp.page);
      setHasNextPage(resp.has_next);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    const updatedReq = { ...currentReq, page: newPage };
    handleExecuteSearch(updatedReq);
  };

  const handleSaveLead = async (biz: Business) => {
    await saveLead(biz.id, "New", "General");
    if (!savedLeadIds.includes(biz.id)) {
      setSavedLeadIds([...savedLeadIds, biz.id]);
    }
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    handleExecuteSearch({ ...currentReq, page: 1 });
  };

  const handleResetFilters = () => {
    const reset = {
      minRating: 0,
      hasWebsite: false,
      hasPhone: false,
      hasEmail: false,
      openNow: false,
      category: "",
    };
    setFilters(reset);
    handleExecuteSearch({ ...currentReq, page: 1 });
  };

  const activeFilterCount =
    (filters.minRating > 0 ? 1 : 0) +
    (filters.hasWebsite ? 1 : 0) +
    (filters.hasPhone ? 1 : 0) +
    (filters.hasEmail ? 1 : 0) +
    (filters.openNow ? 1 : 0) +
    (filters.category ? 1 : 0);

  return (
    <div className="min-h-screen pt-6 space-y-6">
      {/* Hero Header Section */}
      <section className="text-center px-4 max-w-4xl mx-auto space-y-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold"
        >
          <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
          Official API Powered B2B Lead Intelligence Engine
        </motion.div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Find & Convert <span className="gradient-text">Verified Business Leads</span> Instantly
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Query official Google Places API endpoints for dentists, restaurants, real estate agencies, lawyers, and gyms with AI lead scoring & 1-click CRM export.
        </p>
      </section>

      {/* Hero Floating Search Engine Bar */}
      <SearchBar
        onSearch={(req) => handleExecuteSearch(req)}
        onOpenFilters={() => setFilterDrawerOpen(true)}
        isLoading={isLoading}
        activeFilterCount={activeFilterCount}
      />

      {/* Main Results Lead Table */}
      <LeadTable
        businesses={businesses}
        totalResults={totalResults}
        currentPage={currentPage}
        pageSize={currentReq.page_size || 20}
        hasNext={hasNextPage}
        onPageChange={handlePageChange}
        onSaveLead={handleSaveLead}
        onOpenDetails={(biz) => setSelectedDetailsBiz(biz)}
        onBulkExport={(ids) => {
          setExportIds(ids);
          setExportModalOpen(true);
        }}
        savedBusinessIds={savedLeadIds}
        isLoading={isLoading}
      />

      {/* Slide-in Filter Drawer */}
      <FilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Lead Profile Details Modal */}
      <LeadDetailsModal
        business={selectedDetailsBiz}
        isOpen={!!selectedDetailsBiz}
        onClose={() => setSelectedDetailsBiz(null)}
        onSaveLead={handleSaveLead}
        isSaved={selectedDetailsBiz ? savedLeadIds.includes(selectedDetailsBiz.id) : false}
      />

      {/* Bulk Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        selectedLeadIds={exportIds}
        allLeads={businesses}
      />
    </div>
  );
}
