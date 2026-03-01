"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Shield,
    Search,
    Github,
    Plus,
    Clock,
    AlertCircle,
    Settings,
    LayoutDashboard,
    User,
    ArrowRight,
    History,
    Lightbulb,
    ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";

const DUMMY_REPORTS = [
    { id: "v1", repo: "next-js-commerce", date: "2024-03-01 14:20", score: 12, trend: "-2" },
    { id: "v2", repo: "repo-audit-dashboard", date: "2024-03-01 09:15", score: 45, trend: "+5" },
    { id: "v3", repo: "ai-scanner-v2", date: "2024-02-28 18:30", score: 82, trend: "+12" },
    { id: "v4", repo: "next-js-commerce", date: "2024-02-25 10:00", score: 14, trend: "0" },
    { id: "v5", repo: "infrastructure-as-code", date: "2024-02-20 15:45", score: 28, trend: "-10" },
];

export default function ReportsHistoryPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredReports = DUMMY_REPORTS.filter(r =>
        r.repo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-[#09090b] text-white">
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold mb-1 font-sans">Analysis History</h1>
                    <p className="text-zinc-400 text-sm">Track how your codebase health evolves over time.</p>
                </header>

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search reports..."
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
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Timestamp</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 text-center">Tech Debt</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredReports.map((report) => (
                                <tr key={report.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Github className="w-4 h-4 text-zinc-500" />
                                            <span className="font-medium text-zinc-200 group-hover:text-blue-400 transition-colors uppercase tracking-tight text-xs font-mono">{report.repo}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5" /> {report.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex flex-col items-center">
                                            <span className={cn(
                                                "text-sm font-bold",
                                                report.score < 20 ? "text-green-500" : report.score < 50 ? "text-yellow-500" : "text-red-500"
                                            )}>{report.score}%</span>
                                            {report.trend !== "0" && (
                                                <span className={cn("text-[9px] font-black", report.trend.startsWith("-") ? "text-green-500" : "text-red-500")}>
                                                    {report.trend}% vs last
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/repo/${report.id}`}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs font-bold transition-all"
                                        >
                                            Full Report <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredReports.length === 0 && (
                        <div className="py-20 text-center text-zinc-500">
                            No reports found for "{searchQuery}"
                        </div>
                    )}
                </div>
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
