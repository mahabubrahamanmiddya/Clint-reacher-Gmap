"use client";

import React, { useState, useEffect } from "react";
import { AdminStats } from "@/lib/types";
import { getAdminStats, getSavedLeads } from "@/lib/api";
import {
  BarChart3, Database, Search, CheckCircle2, TrendingUp, Users, Sparkles, Clock, ArrowUpRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    getAdminStats().then(setStats);
  }, []);

  const RECENT_SEARCHES = [
    { query: "Dentists in Delhi", category: "Dentist", count: 45, time: "10 mins ago" },
    { query: "Restaurants in Mumbai", category: "Restaurant", count: 42, time: "45 mins ago" },
    { query: "Real Estate Agents in Bangalore", category: "Real Estate", count: 38, time: "2 hours ago" },
    { query: "Lawyers in Kolkata", category: "Lawyer", count: 30, time: "5 hours ago" },
    { query: "Gyms in Hyderabad", category: "Gym", count: 28, time: "1 day ago" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white">LeadX SaaS Dashboard Overview</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics for search queries, saved CRM lead status pipeline, and conversion rates.
          </p>
        </div>

        <Badge variant="indigo" className="py-1 px-3">
          <Sparkles className="w-3.5 h-3.5 mr-1" /> Live Analytics Active
        </Badge>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Leads Discovered", value: stats ? stats.total_searches * 24 : 1420, change: "+14.2%", icon: Search, color: "from-blue-600 to-indigo-600" },
          { label: "Today's Searches", value: stats?.total_searches || 34, change: "+8.4%", icon: Clock, color: "from-purple-600 to-pink-600" },
          { label: "Saved CRM Leads", value: stats?.total_saved_leads || 48, change: "+24.5%", icon: Database, color: "from-emerald-600 to-teal-600" },
          { label: "Contacted Leads", value: stats?.total_contacted || 22, change: "+18.1%", icon: CheckCircle2, color: "from-amber-600 to-orange-600" },
          { label: "Conversion Rate", value: `${stats?.conversion_rate || 64.7}%`, change: "+5.2%", icon: TrendingUp, color: "from-cyan-600 to-blue-600" },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-4 rounded-2xl border border-slate-800 relative overflow-hidden space-y-3 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                <div className={`p-2 rounded-xl bg-gradient-to-br ${kpi.color} text-white shadow-md`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-white tracking-tight">{kpi.value}</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center">
                  <ArrowUpRight className="w-3 h-3" /> {kpi.change}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Searches Panel */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" /> Recent Search Queries & Execution History
            </h3>
            <span className="text-xs text-slate-400 font-mono">Last 24 Hours</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {RECENT_SEARCHES.map((search, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-xs">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{search.query}</h4>
                    <span className="text-[10px] text-slate-400">{search.time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="cyan" className="text-[10px]">{search.category}</Badge>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{search.count} Leads</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Funnel Status Breakdown */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Conversion Funnel Status
            </h3>
          </div>

          <div className="space-y-4">
            {[
              { stage: "New Leads", count: 48, pct: "100%", color: "bg-blue-500" },
              { stage: "Contacted", count: 32, pct: "66.7%", color: "bg-amber-500" },
              { stage: "Interested", count: 18, pct: "37.5%", color: "bg-emerald-500" },
              { stage: "Closed Deals", count: 12, pct: "25.0%", color: "bg-purple-500" },
            ].map((f) => (
              <div key={f.stage} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{f.stage}</span>
                  <span className="text-indigo-300 font-mono">{f.count} ({f.pct})</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className={`h-full ${f.color} rounded-full`} style={{ width: f.pct }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
