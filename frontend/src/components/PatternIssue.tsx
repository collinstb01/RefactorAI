import React from "react";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function PatternIssue({ severity, title, description, impact }: { severity: 'high' | 'medium' | 'low', title: string, description: string, impact: string }) {
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
