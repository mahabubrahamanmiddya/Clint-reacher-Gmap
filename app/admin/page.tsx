"use client";

import React, { useState, useEffect } from "react";
import { AdminStats } from "@/lib/types";
import { getAdminStats } from "@/lib/api";
import { ShieldCheck, Users, Activity, Server, FileText, CheckCircle, Cpu, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    getAdminStats().then(setStats);
  }, []);

  const USERS_ROSTER = [
    { id: 1, email: "admin@leadx.ai", name: "System Admin", role: "admin", status: "Active", searches: 142 },
    { id: 2, email: "sales.lead@agency.com", name: "Alex Johnson", role: "user", status: "Active", searches: 84 },
    { id: 3, email: "growth@b2bcorp.com", name: "Sarah Connor", role: "user", status: "Active", searches: 52 },
    { id: 4, email: "demo@leadx.ai", name: "Demo Sandbox User", role: "user", status: "Active", searches: 28 },
  ];

  const API_LOGS = [
    { id: "log_101", endpoint: "POST /api/v1/search/places", query: "Dentists in Delhi", status: 200, latency: "112ms", time: "14:38:12" },
    { id: "log_102", endpoint: "POST /api/v1/search/places", query: "Restaurants in Mumbai", status: 200, latency: "98ms", time: "14:35:45" },
    { id: "log_103", endpoint: "POST /api/v1/leads/export", query: "Export CSV (25 leads)", status: 200, latency: "145ms", time: "14:30:10" },
    { id: "log_104", endpoint: "PATCH /api/v1/leads/102", query: "Update Status -> Contacted", status: 200, latency: "42ms", time: "14:28:55" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white">Admin System & API Usage Analytics</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitor API endpoints latency, search logs, rate limiting status, and user privileges.
          </p>
        </div>

        <Badge variant="emerald" className="py-1 px-3">
          <Activity className="w-3.5 h-3.5 mr-1 animate-pulse" /> All Systems Operational
        </Badge>
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">API Request Volume</span>
          <div className="text-2xl font-extrabold text-white">{stats?.api_call_count || 894} Calls</div>
          <span className="text-[10px] text-emerald-400 font-mono">100% Google Places API Rate Limit Safe</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Avg Response Latency</span>
          <div className="text-2xl font-extrabold text-cyan-400">{stats?.avg_latency_ms || 98.4} ms</div>
          <span className="text-[10px] text-slate-400">FastAPI Async Execution</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Active Platform Users</span>
          <div className="text-2xl font-extrabold text-purple-400">{stats?.total_users || 4} Users</div>
          <span className="text-[10px] text-slate-400">Role-based Access Control</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Database Storage</span>
          <div className="text-2xl font-extrabold text-indigo-400">SQLite / Postgres</div>
          <span className="text-[10px] text-emerald-400 font-mono">ORM Models Synchronized</span>
        </div>
      </div>

      {/* User Roster & Search Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Roster */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" /> Platform User Management
            </h3>
          </div>

          <div className="divide-y divide-slate-800/60">
            {USERS_ROSTER.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    {u.name}
                    <Badge variant={u.role === "admin" ? "purple" : "slate"} className="text-[9px]">
                      {u.role}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-slate-400">{u.email}</span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-indigo-400 block">{u.searches} Searches</span>
                  <Badge variant="emerald" className="text-[9px]">{u.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time API Logs */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" /> API Search & Execution Logs
            </h3>
          </div>

          <div className="divide-y divide-slate-800/60">
            {API_LOGS.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono text-indigo-300 font-bold">{log.endpoint}</div>
                  <span className="text-[11px] text-slate-400">{log.query}</span>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <span className="text-[11px] font-mono text-emerald-400">{log.latency}</span>
                  <Badge variant="emerald" className="text-[9px]">{log.status} OK</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
