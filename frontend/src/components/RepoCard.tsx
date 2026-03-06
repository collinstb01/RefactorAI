"use client";

import React, { useState, useMemo } from "react";
import {
    Github,
    ArrowRight,
    Box,
    Zap,
    Bug,
    LineChart,
    Loader2,
    Lock,
    GitBranch,
    RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { analysisService, AnalysisHistoryItem } from "@/services/analysis.service";
import { Repository } from "@/services/repo.service";
import { getToken } from "@/lib/token";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const FEATURES = [
    { id: "architecture", label: "Architecture", icon: <Box className="w-3 h-3" /> },
    { id: "refactor", label: "Refactor", icon: <Zap className="w-3 h-3" /> },
    { id: "issues", label: "Issues", icon: <Bug className="w-3 h-3" /> },
    { id: "metrics", label: "Metrics", icon: <LineChart className="w-3 h-3" /> },
];

export function RepoCard({ repo, history }: { repo: Repository; history: AnalysisHistoryItem[] }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    const [selectedFeature, setSelectedFeature] = useState("issues");

    // Track specifically triggered analysis to surface real-time polling immediately
    const [analysisId, setAnalysisId] = useState<number | null>(null);
    const [isTriggering, setIsTriggering] = useState(false);

    // Poll for status if we just triggered a new analysis from THIS card
    const { data: analysisStatus } = useQuery({
        queryKey: ["analysisStatus", analysisId],
        queryFn: () => analysisService.getAnalysisStatus(analysisId!),
        enabled: !!analysisId,
        refetchInterval: (query) => {
            const data = query.state.data;
            if (data?.status === "completed" || data?.status === "failed") {
                return false;
            }
            return 1000;
        },
    });

    // Determine the historical status of the currently selected feature
    const activeAnalysis = useMemo(() => {
        return history
            .filter((h) => h.analysis_type?.toLowerCase().includes(selectedFeature.toLowerCase()))
            .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())[0];
    }, [history, selectedFeature]);

    // If there's an active local poll matching the feature, it takes precedence
    const isLocalPolling = analysisId && analysisStatus?.analysis_type?.toLowerCase().includes(selectedFeature.toLowerCase());
    const effectiveStatus = isLocalPolling ? analysisStatus : activeAnalysis;

    const isCurrentlyAnalyzing = isTriggering || effectiveStatus?.status === "pending" || effectiveStatus?.status === "in_progress";

    const handleAnalyze = async () => {
        setIsTriggering(true);
        try {
            const response = await analysisService.startAnalysis({
                repo_id: repo.id,
                repo_name: repo.name,
                repo_url: repo.repo_url,
                token: getToken() || "",
                type: selectedFeature,
            });
            if (response.analysis_id) {
                setAnalysisId(response.analysis_id);
                // Also optionally invalidate history so the global state updates eventually
                queryClient.invalidateQueries({ queryKey: ["repos"] });
                toast.success(`Analysis for ${repo.name} started!`);
            }
        } catch (error: unknown) {
            console.error("[Analysis] Failed:", error);
            const axiosError = error as { response?: { data?: { detail?: unknown } } };
            const detail = axiosError?.response?.data?.detail;
            const msg = typeof detail === "string"
                ? detail
                : Array.isArray(detail)
                    ? detail.map((d: { msg?: string }) => d.msg || "").join(", ")
                    : "Failed to trigger analysis. Please wait a moment.";
            toast.error(msg);
        } finally {
            setIsTriggering(false);
        }
    };

    return (
        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/40 transition-all group flex flex-col h-full relative overflow-hidden">
            {/* Loading Overlay for active session progress */}
            {isCurrentlyAnalyzing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                    <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin mb-4" />
                    <p className="text-sm font-bold text-white mb-2">Analyzing {repo.name}</p>
                    <p className="text-[11px] text-zinc-400 max-w-[200px] leading-relaxed italic">
                        {effectiveStatus?.summary || "Initializing..."}
                    </p>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/5">
                        <Github className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                        <a
                            href={repo.repo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-sm hover:text-blue-400 transition-colors"
                        >
                            {repo.name}
                        </a>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{repo.full_name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {repo.private ? (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded-full font-bold uppercase">
                            <Lock className="w-2.5 h-2.5" /> Private
                        </span>
                    ) : (
                        <span className="text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-full font-bold uppercase">
                            Public
                        </span>
                    )}
                </div>
            </div>

            {/* Feature Selection */}
            <div className="mb-5 flex-1">
                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-3">
                    Select Analysis Module
                </p>
                <div className="flex flex-wrap gap-2">
                    {FEATURES.map((feature) => {
                        // Check if this specific feature has been completed in history
                        const featureHistory = history
                            .filter((h) => h.analysis_type?.toLowerCase().includes(feature.id.toLowerCase()))
                            .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())[0];

                        const hasRun = featureHistory?.status === "completed";

                        return (
                            <button
                                key={feature.id}
                                disabled={!!isCurrentlyAnalyzing}
                                onClick={() => setSelectedFeature(feature.id)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all",
                                    selectedFeature === feature.id
                                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30 ring-1 ring-blue-500/20"
                                        : "bg-zinc-800/50 text-zinc-500 border-white/5 hover:border-white/10 hover:text-zinc-300",
                                    hasRun && selectedFeature !== feature.id && "bg-emerald-500/5 text-emerald-500/70 border-emerald-500/10" // subtle hint it's completed
                                )}
                            >
                                {feature.icon}
                                {feature.label}
                                {hasRun && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5 h-12">
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                        <GitBranch className="w-3 h-3" /> {repo.default_branch}
                    </span>
                    {effectiveStatus?.score !== null && effectiveStatus?.score !== undefined && selectedFeature === "issues" && (
                        <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                            effectiveStatus.score >= 70 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                effectiveStatus.score >= 40 ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                    "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>
                            Score: {effectiveStatus.score}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {effectiveStatus?.status === "completed" ? (
                        <>
                            <button
                                disabled={!!isCurrentlyAnalyzing}
                                onClick={handleAnalyze}
                                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 active:scale-95 disabled:opacity-50"
                            >
                                <RefreshCw className="w-3 h-3" /> Reanalyze
                            </button>
                            <button
                                onClick={() => router.push(`/repo/${repo.id}`)}
                                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-lg bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 border border-emerald-400/50"
                            >
                                View Results <ArrowRight className="w-3 h-3" />
                            </button>
                        </>
                    ) : effectiveStatus?.status === "failed" ? (
                        <button
                            onClick={handleAnalyze}
                            disabled={!!isCurrentlyAnalyzing}
                            className="px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 active:scale-95"
                        >
                            <RefreshCw className="w-3 h-3" /> Retry
                        </button>
                    ) : (
                        <button
                            disabled={!!isCurrentlyAnalyzing}
                            onClick={handleAnalyze}
                            className={cn(
                                "px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg",
                                isCurrentlyAnalyzing
                                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                    : "bg-white text-black hover:bg-zinc-200 active:scale-95"
                            )}
                        >
                            {isCurrentlyAnalyzing ? (
                                <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Triggering...
                                </>
                            ) : (
                                <>
                                    Analyze <ArrowRight className="w-3 h-3" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
