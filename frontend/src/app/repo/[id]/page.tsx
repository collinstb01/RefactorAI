"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Shield,
    ArrowLeft,
    LayoutDashboard,
    Settings,
    Bug,
    Zap,
    Layout,
    Activity,
    AlertTriangle,
    CheckCircle2,
    ChevronRight,
    TrendingUp,
    BarChart2
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";

const COMPLEXITY_DATA = [
    { name: "Week 1", value: 400 },
    { name: "Week 2", value: 300 },
    { name: "Week 3", value: 600 },
    { name: "Week 4", value: 800 },
    { name: "Week 5", value: 500 },
    { name: "Week 6", value: 900 },
    { name: "Week 7", value: 700 },
];

const METRIC_DATA = [
    { name: "Auth", score: 85 },
    { name: "Middleware", score: 45 },
    { name: "Database", score: 92 },
    { name: "UI Components", score: 68 },
    { name: "API Routes", score: 30 },
];

export default function RepoAnalysisPage() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-[#09090b] text-white">
                <Sidebar />
                <main className="flex-1 ml-64 p-8">
                    <div className="animate-pulse space-y-8">
                        <div className="h-8 bg-zinc-800 rounded w-1/4"></div>
                        <div className="grid grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-zinc-800 rounded-xl"></div>)}
                        </div>
                        <div className="h-64 bg-zinc-800 rounded-xl"></div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="h-96 bg-zinc-800 rounded-xl"></div>
                            <div className="h-96 bg-zinc-800 rounded-xl"></div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#09090b] text-white">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 rounded-lg hover:bg-white/5 transition-all">
                            <ArrowLeft className="w-5 h-5 text-zinc-400" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                repo-audit-dashboard
                                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider">Public</span>
                            </h1>
                            <p className="text-zinc-500 text-sm">Last deep scan completed 5 hours ago</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-all">Export Report</button>
                        <button className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-zinc-200 transition-all">Re-scan Now</button>
                    </div>
                </header>

                {/* Top Metrics */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                    <MetricCard label="Health Score" value="64/100" trend="+12%" type="score" />
                    <MetricCard label="Bad Patterns" value="14" trend="-2" type="warning" />
                    <MetricCard label="File Complexity" value="High" type="status" />
                    <MetricCard label="Test Coverage" value="82%" trend="+5%" type="success" />
                </div>

                {/* Content Tabs */}
                <div className="grid grid-cols-12 gap-8">
                    {/* Left Column - Charts & Architecture */}
                    <div className="col-span-8 space-y-8">
                        <section className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <BarChart2 className="w-5 h-5 text-blue-400" /> Codebase Complexity Trend
                            </h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={COMPLEXITY_DATA}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                        <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                                            itemStyle={{ color: "#fff" }}
                                        />
                                        <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        <section className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Layout className="w-5 h-5 text-purple-400" /> Architecture Overview
                            </h3>
                            <div className="prose prose-invert max-w-none text-zinc-400 text-sm leading-relaxed space-y-4">
                                <p>
                                    Your codebase follows a standard Next.js App Router architecture.
                                    However, we detected significant **logic leakage** from the service layer into the UI components in the `/dashboard` directory.
                                </p>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                                        <h4 className="font-bold text-white mb-2 text-xs uppercase tracking-widest opacity-60">Strengths</h4>
                                        <ul className="text-xs space-y-2">
                                            <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /> Modular component structure</li>
                                            <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /> Consistent naming conventions</li>
                                        </ul>
                                    </div>
                                    <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                                        <h4 className="font-bold text-white mb-2 text-xs uppercase tracking-widest opacity-60">Weaknesses</h4>
                                        <ul className="text-xs space-y-2">
                                            <li className="flex items-center gap-2"><AlertTriangle className="w-3 h-3 text-yellow-500" /> Circular dependency in /lib</li>
                                            <li className="flex items-center gap-2"><AlertTriangle className="w-3 h-3 text-yellow-500" /> Deeply nested prop drilling</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Issues & Improvements */}
                    <div className="col-span-4 space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 px-2">
                            <TrendingUp className="w-5 h-5 text-emerald-400" /> Critical Patterns
                        </h3>

                        <PatternIssue
                            severity="high"
                            title="God Object Pattern"
                            description="DashboardLayout.tsx has grown to 1.2k LOC and manages 15+ states."
                            impact="Difficult to test, slow rendering"
                        />

                        <PatternIssue
                            severity="medium"
                            title="Redundant API Calls"
                            description="User profile is fetched 3 times on the settings page concurrently."
                            impact="Performance bottleneck"
                        />

                        <PatternIssue
                            severity="low"
                            title="Inline CSS Styles"
                            description="12 instances of hardcoded hex colors found in components."
                            impact="Maintenance burden"
                        />

                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 mt-4">
                            <h4 className="font-bold mb-2 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" /> AI Optimization Tip
                            </h4>
                            <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
                                Refactoring the auth middleware to use edge runtime could reduce initial
                                page load speed by **240ms**.
                            </p>
                            <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all">
                                Apply Fix via PR
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}



function MetricCard({ label, value, trend, type }: { label: string, value: string, trend?: string, type: string }) {
    return (
        <div className="p-5 rounded-2xl border border-white/5 bg-zinc-900/20">
            <div className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">{label}</div>
            <div className="flex items-end justify-between">
                <div className="text-2xl font-bold">{value}</div>
                {trend && (
                    <div className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded",
                        trend.startsWith("+") ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10")}>
                        {trend}
                    </div>
                )}
            </div>
        </div>
    );
}

function PatternIssue({ severity, title, description, impact }: { severity: 'high' | 'medium' | 'low', title: string, description: string, impact: string }) {
    const colors = {
        high: "text-red-400 border-red-400/20 bg-red-400/5",
        medium: "text-yellow-400 border-yellow-400/20 bg-yellow-400/5",
        low: "text-zinc-400 border-zinc-400/20 bg-zinc-400/5"
    };

    return (
        <div className={cn("p-4 rounded-xl border transition-all hover:bg-zinc-800/10", colors[severity])}>
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-sm text-white">{title}</h4>
                <span className="text-[9px] uppercase font-black opacity-60 tracking-tighter px-1.5 py-0.5 rounded border border-current">
                    {severity}
                </span>
            </div>
            <p className="text-xs opacity-70 mb-3 leading-snug">{description}</p>
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest opacity-40">
                <Activity className="w-3 h-3" /> Impact: {impact}
            </div>
        </div>
    );
}
