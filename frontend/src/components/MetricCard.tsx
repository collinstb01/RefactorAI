import React from "react";
import { cn } from "@/lib/utils";

export function MetricCard({ label, value, trend, type }: { label: string, value: string, trend?: string, type: string }) {
    return (
        <div className="p-5 rounded-2xl border border-white/5 bg-zinc-900/20">
            <div className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">{label}</div>
            <div className="flex items-end justify-between">
                <div className="text-2xl font-bold">{value}</div>
                {trend && (
                    <div className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded",
                        trend.startsWith("+") ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10")}>
                        {trend}
                    </div>
                )}
            </div>
        </div>
    );
}
