"use client";

import React, { useState, useEffect } from "react";
import { LeadMap } from "@/components/map/lead-map";
import { Business } from "@/lib/types";
import { searchPlaces } from "@/lib/api";
import { MapPin, Search, Sparkles, Navigation, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DedicatedMapPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [query, setQuery] = useState("Dentists in Delhi");
  const [city, setCity] = useState("Delhi");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    handleFetchMapLeads();
  }, []);

  const handleFetchMapLeads = async () => {
    setIsLoading(true);
    try {
      const res = await searchPlaces({
        query: query.trim() || "Dentists in Delhi",
        city: city.trim() || "Delhi",
        page: 1,
        page_size: 25,
      });
      setBusinesses(res.results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white">Interactive Radius & Map Exploration</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualize local businesses directly on geo-coordinates with interactive pins & location cluster data.
          </p>
        </div>

        {/* Map Search Control Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFetchMapLeads();
          }}
          className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Restaurants in Mumbai"
            className="px-3 py-1.5 bg-transparent text-xs text-white outline-none w-48 sm:w-64"
          />
          <Button type="submit" size="sm" isLoading={isLoading} className="bg-indigo-600 hover:bg-indigo-500">
            <Search className="w-3.5 h-3.5" /> Map Search
          </Button>
        </form>
      </div>

      {/* Map Component Container */}
      <div className="h-[600px] w-full">
        <LeadMap businesses={businesses} />
      </div>
    </div>
  );
}
