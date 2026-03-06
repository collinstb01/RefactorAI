"use client";

import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { Clock, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

export default function HistoryPage() {
    const { data: history, isLoading } = useQuery({
        queryKey: ["history", "all"],
        queryFn: async () => {
            const res = await api.get("/analyze/history/all");
            return res.data;
        },
    });

    return (
        <div className="flex min-h-screen bg-[#09090b] text-white">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <header className="mb-8 border-b border-white/10 pb-6">
                    <h1 className="text-2xl font-bold mb-2">Analysis History</h1>
                    <p className="text-zinc-400 text-sm">Review all your past repository scans.</p>
                </header>

                {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-zinc-900/50 rounded-xl border border-white/5" />
                        ))}
                    </div>
                ) : !history || history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-zinc-500 border border-dashed border-white/10 rounded-2xl">
                        <Clock className="w-12 h-12 mb-4 opacity-50" />
                        <p>No analysis history found.</p>
                        <Link href="/dashboard" className="text-blue-400 mt-2 text-sm hover:underline">Go analyze a repo</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.map((item: any) => (
                            <Link
                                key={item.id}
                                href={`/repo/${item.id}`}
                                className="block p-5 rounded-2xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/60 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center",
                                            item.status === 'completed' ? "bg-emerald-500/10 text-emerald-400" :
                                                item.status === 'failed' ? "bg-red-500/10 text-red-400" :
                                                    "bg-blue-500/10 text-blue-400"
                                        )}>
                                            {item.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> :
                                                item.status === 'failed' ? <AlertTriangle className="w-5 h-5" /> :
                                                    <Clock className="w-5 h-5" />}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-lg">{item.repo_name}</h3>
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-zinc-300">
                                                    {item.analysis_type}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-500 flex items-center gap-2">
                                                {new Date(item.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        {item.score !== null && (
                                            <div className="text-right">
                                                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block mb-0.5">Score</span>
                                                <span className={cn(
                                                    "text-xl font-bold",
                                                    item.score >= 70 ? "text-emerald-400" :
                                                        item.score >= 40 ? "text-yellow-400" : "text-red-400"
                                                )}>{item.score}</span>
                                            </div>
                                        )}
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
