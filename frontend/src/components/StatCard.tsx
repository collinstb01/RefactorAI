import React from "react";

export function StatCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/20">
            <div className="flex items-center gap-2 text-zinc-500 text-xs mb-2">
                {icon} {label}
            </div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    );
}
