"use client";

import { Loader2, CheckCircle2, ChevronRight } from "lucide-react";
import { AnalysisDetail } from "@/services/analysis.service";
import { cn } from "@/lib/utils";
import React from "react";
import { StatusBadge } from "./StatusBadge";
import { AnalyzeButton } from "./AnalyzeButton";
import { IssueRow } from "./IssueRow";

const IMPACT_CONFIG: Record<string, { color: string; bg: string }> = {
    high: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
    medium: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
    low: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
};

export interface AnalysisSectionProps {
    title: string;
    icon: React.ReactNode;
    analysisType: string;
    data: AnalysisDetail | null | undefined;
    repoId: number;
    repoName: string;
    repoUrl: string;
    onAnalysisStarted: (type: string, analysisId: number) => void;
}

export function AnalysisSection({
    title,
    icon,
    analysisType,
    data,
    repoId,
    repoName,
    repoUrl,
    onAnalysisStarted,
}: AnalysisSectionProps) {
    const isAnalyzed = !!data && data.status === "completed";
    const isPending = !!data && (data.status === "pending" || data.status === "in_progress");
    const isFailed = !!data && data.status === "failed";

    return (
        <section className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30 space-y-4">
            {/* Section header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2 text-zinc-200">
                    {icon}
                    {title}
                </h3>
                <StatusBadge status={data?.status} />
            </div>

            {/* In progress state */}
            {isPending && (
                <div className="flex flex-col items-center gap-2 py-8 text-zinc-500">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                    <p className="text-xs">{data.summary || "Analysis in progress..."}</p>
                </div>
            )}

            {/* Error state */}
            {isFailed && (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                    <p className="text-xs text-red-500 mb-2">{data.summary || "Analysis failed."}</p>
                </div>
            )}

            {/* Not yet analyzed or failed */}
            {(!data || isFailed) && (
                <AnalyzeButton
                    label={isFailed ? `Retry ${title}` : `Run ${title}`}
                    analysisType={analysisType}
                    repoId={repoId}
                    repoName={repoName}
                    repoUrl={repoUrl}
                    onSuccess={(id) => onAnalysisStarted(analysisType, id)}
                />
            )}

            {/* Summary (all types) */}
            {isAnalyzed && data.summary && (
                <p className="text-sm text-zinc-400 leading-relaxed border-l-2 border-white/10 pl-3">
                    {data.summary}
                </p>
            )}

            {/* ── Issues ──────────────────────────────────────────────────── */}
            {isAnalyzed && analysisType === "issues" && (
                <>
                    {(data.issues ?? []).length === 0 ? (
                        <div className="flex flex-col items-center py-8 text-zinc-600 gap-2">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
                            <p className="text-sm">No issues found. Clean codebase! 🎉</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                            {(data.issues ?? []).map((issue) => (
                                <IssueRow key={issue.id} issue={issue} />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ── Metrics ─────────────────────────────────────────────────── */}
            {isAnalyzed && analysisType === "metrics" && (
                <div className="space-y-4">
                    {(data.metrics ?? []).map((m) => (
                        <div key={m.id} className="space-y-1.5">
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-zinc-500 font-medium uppercase tracking-wider">{m.name}</span>
                                <span className="text-zinc-300 font-bold">{m.value}%</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-1000",
                                        m.value >= 75 ? "bg-emerald-500" : m.value >= 50 ? "bg-yellow-500" : "bg-red-500"
                                    )}
                                    style={{ width: `${m.value}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Architecture ─────────────────────────────────────────────── */}
            {isAnalyzed && analysisType === "architecture" && data.architecture && (
                <div className="space-y-4">
                    {data.architecture.patterns.length > 0 && (
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Detected Patterns</p>
                            <div className="flex flex-wrap gap-2">
                                {data.architecture.patterns.map((p, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-medium">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {data.architecture.recommendations.length > 0 && (
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Recommendations</p>
                            <ul className="space-y-2">
                                {data.architecture.recommendations.map((r, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                                        <ChevronRight className="w-3 h-3 mt-0.5 text-emerald-400 shrink-0" />
                                        {r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* ── Refactor ─────────────────────────────────────────────────── */}
            {isAnalyzed && analysisType === "refactor" && (
                <div className="space-y-3">
                    {(data.suggestions ?? []).length === 0 ? (
                        <div className="text-center py-8 text-zinc-600 text-sm">No refactor suggestions.</div>
                    ) : (
                        (data.suggestions ?? []).map((s) => {
                            const impact = IMPACT_CONFIG[s.impact] ?? IMPACT_CONFIG.medium;
                            return (
                                <div key={s.id} className="p-4 rounded-xl bg-black/30 border border-white/5 hover:border-white/10 transition-all space-y-1.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-xs font-bold text-zinc-200">{s.title}</p>
                                        <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0", impact.bg, impact.color)}>
                                            {s.impact}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-400 leading-relaxed">{s.description}</p>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </section>
    );
}
