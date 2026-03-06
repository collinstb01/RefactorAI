import { CheckCircle2, AlertTriangle, Loader2, Zap } from "lucide-react";

export function StatusBadge({ status }: { status: string | undefined }) {
    if (status === "completed") {
        return (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3" /> Analyzed
            </span>
        );
    }
    if (status === "failed") {
        return (
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">
                <AlertTriangle className="w-3 h-3" /> Failed
            </span>
        );
    }
    if (status === "pending" || status === "in_progress") {
        return (
            <span className="flex items-center gap-1 text-[10px] font-bold text-blue-400 uppercase tracking-wider animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" /> Analyzing
            </span>
        );
    }
    return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            <Zap className="w-3 h-3" /> Not analyzed
        </span>
    );
}
