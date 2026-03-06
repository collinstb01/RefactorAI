"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Search,
    Github,
    Clock,
    ExternalLink,
    Box,
    Zap,
    Bug,
    LineChart,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
import { useQuery } from "@tanstack/react-query";
import { analysisService } from "@/services/analysis.service";

export default function ReportsHistoryPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const { data: reports = [], isLoading } = useQuery({
        queryKey: ["analysisHistory", "all"],
        queryFn: () => analysisService.getHistory(),
    });

    const filteredReports = reports.filter(r =>
        r.repo_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.analysis_type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getIcon = (type: string) => {
        const t = type.toLowerCase();
        if (t.includes("arch")) return <Box className="w-3.5 h-3.5" />;
        if (t.includes("refactor")) return <Zap className="w-3.5 h-3.5" />;
        if (t.includes("issue")) return <Bug className="w-3.5 h-3.5" />;
        if (t.includes("metric")) return <LineChart className="w-3.5 h-3.5" />;
        return <Github className="w-3.5 h-3.5" />;
    };

    return (
        <div className="flex min-h-screen bg-[#09090b] text-white">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold mb-1 font-sans">Analysis History</h1>
                    <p className="text-zinc-400 text-sm">Track how your codebase health evolves over time.</p>
                </header>

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search reports by repo or type..."
                        className="w-full bg-zinc-900/50 border border-white/5 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="rounded-2xl border border-white/5 bg-zinc-900/20 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Repository</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Analysis Type</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Timestamp</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 text-center">Result</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-zinc-500 mx-auto mb-2" />
                                        <p className="text-zinc-500 text-sm">Loading history...</p>
                                    </td>
                                </tr>
                            ) : filteredReports.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-zinc-500">
                                        {searchQuery ? `No reports found matching "${searchQuery}"` : "No analysis history available."}
                                    </td>
                                </tr>
                            ) : (
                                filteredReports.map((report) => (
                                    <tr key={report.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Github className="w-4 h-4 text-zinc-500" />
                                                <span className="font-medium text-zinc-200 group-hover:text-blue-400 transition-colors uppercase tracking-tight text-xs font-mono">
                                                    {report.repo_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-zinc-300 font-bold capitalize">
                                                {getIcon(report.analysis_type)}
                                                {report.analysis_type}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-400">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(report.created_at).toLocaleString(undefined, {
                                                    dateStyle: "medium", timeStyle: "short"
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {report.status !== "completed" ? (
                                                <span className={cn(
                                                    "text-xs font-bold px-2 py-0.5 rounded-full border",
                                                    report.status === "failed" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                )}>
                                                    {report.status}
                                                </span>
                                            ) : report.analysis_type === "issues" && report.score !== null ? (
                                                <span className={cn(
                                                    "text-sm font-bold",
                                                    report.score >= 70 ? "text-green-500" : report.score >= 40 ? "text-yellow-500" : "text-red-500"
                                                )}>
                                                    Score: {report.score}
                                                </span>
                                            ) : (
                                                <span className="text-sm font-bold text-emerald-500 tracking-wide uppercase">Analyzed</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/repo/${report.repo_id}`}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs font-bold transition-all"
                                            >
                                                View Repo <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
