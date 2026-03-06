import { Bug, Layout, Zap, ShieldAlert, FileCode } from "lucide-react";
import { AnalysisIssue } from "@/services/analysis.service";
import { cn } from "@/lib/utils";
import React from "react";

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    HIGH: { label: "High", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
    MEDIUM: { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
    LOW: { label: "Low", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    CRITICAL: { label: "Critical", color: "text-red-500", bg: "bg-red-600/10 border-red-600/20" },
};

const TYPE_ICON: Record<string, React.ReactNode> = {
    bug: <Bug className="w-3.5 h-3.5" />,
    security: <ShieldAlert className="w-3.5 h-3.5" />,
    performance: <Zap className="w-3.5 h-3.5" />,
    architecture: <Layout className="w-3.5 h-3.5" />,
    style: <FileCode className="w-3.5 h-3.5" />,
};

export function IssueRow({ issue }: { issue: AnalysisIssue }) {
    const sev = SEVERITY_CONFIG[issue.severity] ?? SEVERITY_CONFIG.LOW;
    const icon = TYPE_ICON[issue.type?.toLowerCase()] ?? <Bug className="w-3.5 h-3.5" />;

    return (
        <div className="p-4 rounded-xl bg-black/30 border border-white/5 hover:border-white/10 transition-all space-y-2">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-zinc-300 text-xs font-semibold flex-1 min-w-0">
                    <span className="text-zinc-500">{icon}</span>
                    <span className="truncate font-mono text-[11px] text-zinc-400">{issue.file_path}</span>
                </div>
                <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0", sev.bg, sev.color)}>
                    {sev.label}
                </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">{issue.description}</p>
            {issue.suggestion && (
                <p className="text-[11px] text-emerald-400/80 italic border-l-2 border-emerald-500/30 pl-2 leading-relaxed">
                    💡 {issue.suggestion}
                </p>
            )}
        </div>
    );
}
