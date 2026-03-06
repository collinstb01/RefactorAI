"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Shield,
    Search,
    Github,
    Settings,
    LayoutDashboard,
    User,
    History,
    Lightbulb,
    Zap,
    Layout,
    Code,
    AlertTriangle,
    ArrowUpRight,
    Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
import { InsightCard } from "@/components/InsightCard";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";


export default function InsightsPage() {
    const [filter, setFilter] = useState("All");

    const { data: insights = [], isLoading } = useQuery({
        queryKey: ["insights", "all"],
        queryFn: async () => {
            const res = await api.get("/analyze/insights/all");
            return res.data;
        },
    });

    // Derive categories automatically from data
    const categories = ["All", ...Array.from(new Set(insights.map((i: any) => i.category || 'General'))) as string[]];

    const filteredInsights = filter === "All"
        ? insights
        : insights.filter((i: any) => (i.category || 'General') === filter);


    return (
        <div className="flex min-h-screen bg-[#09090b] text-white">
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <header className="mb-10">
                    <h1 className="text-2xl font-bold mb-1">AI Insights & Suggestions</h1>
                    <p className="text-zinc-400 text-sm">Aggregated actionable improvements across your connected codebases.</p>
                </header>

                {/* Filter Chips */}
                <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    <Filter className="w-4 h-4 text-zinc-500 mr-2 shrink-0" />
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0",
                                filter === cat ? "bg-white text-black border-white" : "bg-white/5 text-zinc-400 border-white/5 hover:border-white/20"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Insights Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-64 rounded-2xl border border-white/5 bg-zinc-900/30 animate-pulse" />
                        ))}
                    </div>
                ) : filteredInsights.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
                        <Lightbulb className="w-12 h-12 mb-4 opacity-30" />
                        <p className="text-sm font-medium text-center max-w-sm">
                            {filter === "All" ? "No critical or high severity insights found across your repositories. Your code is looking healthy! 🎉" : "No insights found for this category."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredInsights.map((insight: any) => (
                            <InsightCard key={insight.id} insight={insight} />
                        ))}
                    </div>
                )}
            </main>
        </div>

    );
}


function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <div className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
            active ? "bg-white/5 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
        )}>
            {icon}
            {label}
        </div>
    );
}
