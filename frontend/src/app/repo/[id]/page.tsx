"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Layout,
    AlertTriangle,
    Bug,
    Wrench,
    BarChart2,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    analysisService,
    AnalysisDetail,
} from "@/services/analysis.service";
import { Sidebar } from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import { AnalysisSection } from "@/components/repo/AnalysisSection";

export default function RepoAnalysisPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();

    // The URL can carry either an analysisId OR a repoId depending on the source.
    // We load one initial analysis if present, then augment with full repo history.
    const analysisId = Number(params.id);

    // 1. Fetch the specific analysis record (for the initial load from RepoCard)
    const { data: initialAnalysis, isLoading, isError } = useQuery({
        queryKey: ["analysisDetail", analysisId],
        queryFn: () => analysisService.getAnalysisDetail(analysisId),
        enabled: !!analysisId,
        staleTime: 1000 * 30, // refresh every 30s while on this page
    });

    const repoId = initialAnalysis?.repo_id;

    // 2. Fetch full repo history to get all analysis types
    const { data: repoHistory = [], isLoading: isHistoryLoading } = useQuery({
        queryKey: ["repoHistory", repoId],
        queryFn: () => analysisService.getRepoHistory(repoId!),
        enabled: !!repoId,
        staleTime: 1000 * 30,
        refetchInterval: (data) => {
            // Keep polling if any analysis is in progress
            const hasPending = (data?.state?.data ?? []).some(
                (a) => a.status === "pending" || a.status === "in_progress"
            );
            return hasPending ? 3000 : false;
        },
    });
    console.log("repoId", repoHistory, initialAnalysis);


    // Track in-flight analyses (started from this page) to show pending state immediately
    const [pendingAnalyses, setPendingAnalyses] = useState<Record<string, number>>({});

    const handleAnalysisStarted = (type: string, newAnalysisId: number) => {
        setPendingAnalyses((prev) => ({ ...prev, [type]: newAnalysisId }));
        // Invalidate repo history so we start polling
        queryClient.invalidateQueries({ queryKey: ["repoHistory", repoId] });
    };

    // Build a map: type -> most recent completed (or in-progress) analysis
    const byType = (type: string): AnalysisDetail | null => {
        // First check history from DB
        const fromHistory = repoHistory
            .filter((a) => a.analysis_type?.toLowerCase().includes(type.toLowerCase()))
            .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())[0];

        if (fromHistory) return fromHistory;

        // Fall back to in-flight local state (so the loading spinner shows immediately)
        if (pendingAnalyses[type]) {
            return {
                id: pendingAnalyses[type],
                status: "pending",
                analysis_type: type,
                summary: "Analysis starting...",
                score: null,
                completed_at: null,
                repo_id: repoId!,
                created_at: new Date().toISOString(),
            };
        }

        return null;
    };

    const issuesAnalysis = byType("issues");
    const metricsAnalysis = byType("metrics");
    const architectureAnalysis = byType("architecture");
    const refactorAnalysis = byType("refactor");

    const repoName = initialAnalysis ? `Repo #${initialAnalysis.repo_id}` : "Repository";
    const repoUrl = ""; // not stored on analysis; passed from URL state if ever available

    // ── Loading ────────────────────────────────────────────────────────────────
    if (isLoading || isHistoryLoading) {
        return (
            <div className="flex min-h-screen bg-[#09090b] text-white">
                <Sidebar />
                <main className="flex-1 ml-64 p-8">
                    <div className="animate-pulse space-y-8">
                        <div className="h-8 bg-zinc-800 rounded w-1/4" />
                        <div className="grid grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-zinc-800 rounded-2xl" />)}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (isError || !initialAnalysis) {
        return (
            <div className="flex min-h-screen bg-[#09090b] text-white">
                <Sidebar />
                <main className="flex-1 ml-64 p-8 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <AlertTriangle className="w-10 h-10 text-yellow-400 mx-auto" />
                        <p className="text-zinc-400">Could not load analysis results.</p>
                        <Link href="/dashboard" className="text-blue-400 text-sm hover:underline">← Back to dashboard</Link>
                    </div>
                </main>
            </div>
        );
    }

    // ── Score summary (issues-based) ───────────────────────────────────────────
    const issues = issuesAnalysis?.issues ?? [];
    const highCount = issues.filter(i => i.severity === "HIGH" || i.severity === "CRITICAL").length;
    const medCount = issues.filter(i => i.severity === "MEDIUM").length;
    const lowCount = issues.filter(i => i.severity === "LOW").length;
    const score = issuesAnalysis?.score ?? 0;

    const SHARED_SECTION_PROPS = {
        repoId: repoId!,
        repoName,
        repoUrl,
        onAnalysisStarted: handleAnalysisStarted,
    };

    return (
        <div className="flex min-h-screen bg-[#09090b] text-white">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 rounded-lg hover:bg-white/5 transition-all">
                            <ArrowLeft className="w-5 h-5 text-zinc-400" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Repository Analysis</h1>
                            <p className="text-zinc-500 text-sm">Run any of the 4 analysis types to inspect your codebase.</p>
                        </div>
                    </div>
                </header>

                {/* Top summary stats (from issues analysis if available) */}
                {issuesAnalysis?.status === "completed" && (
                    <div className="grid grid-cols-4 gap-6 mb-8">
                        <div className="p-5 rounded-2xl border border-white/5 bg-zinc-900/30 flex flex-col gap-1">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Health Score</span>
                            <span className={cn("text-3xl font-bold", score >= 75 ? "text-emerald-400" : score >= 50 ? "text-yellow-400" : "text-red-400")}>
                                {score}<span className="text-sm text-zinc-500">/100</span>
                            </span>
                        </div>
                        <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5 flex flex-col gap-1">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">High Severity</span>
                            <span className="text-3xl font-bold text-red-400">{highCount}</span>
                        </div>
                        <div className="p-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 flex flex-col gap-1">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Medium Severity</span>
                            <span className="text-3xl font-bold text-yellow-400">{medCount}</span>
                        </div>
                        <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex flex-col gap-1">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Low Severity</span>
                            <span className="text-3xl font-bold text-blue-400">{lowCount}</span>
                        </div>
                    </div>
                )}

                {/* 4 Analysis sections in a 2×2 grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <AnalysisSection
                        title="Issues Scan"
                        icon={<Bug className="w-4 h-4 text-red-400" />}
                        analysisType="issues"
                        data={issuesAnalysis}
                        {...SHARED_SECTION_PROPS}
                    />
                    <AnalysisSection
                        title="Code Metrics"
                        icon={<BarChart2 className="w-4 h-4 text-blue-400" />}
                        analysisType="metrics"
                        data={metricsAnalysis}
                        {...SHARED_SECTION_PROPS}
                    />
                    <AnalysisSection
                        title="Architecture Review"
                        icon={<Layout className="w-4 h-4 text-purple-400" />}
                        analysisType="architecture"
                        data={architectureAnalysis}
                        {...SHARED_SECTION_PROPS}
                    />
                    <AnalysisSection
                        title="Refactor Suggestions"
                        icon={<Wrench className="w-4 h-4 text-emerald-400" />}
                        analysisType="refactor"
                        data={refactorAnalysis}
                        {...SHARED_SECTION_PROPS}
                    />
                </div>
            </main>
        </div>
    );
}
