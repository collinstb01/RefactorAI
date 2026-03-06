import React from "react";
import Link from "next/link";
import { Github, Zap, Shield, Layout, Code, AlertTriangle, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function InsightCard({ insight }: { insight: any }) {
    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'critical': return "text-red-500 border-red-500/20 bg-red-500/5";
            case 'high': return "text-orange-500 border-orange-500/20 bg-orange-500/5";
            case 'medium': return "text-yellow-500 border-yellow-500/20 bg-yellow-500/5";
            default: return "text-blue-500 border-blue-500/20 bg-blue-500/5";
        }
    };

    const getCategoryIcon = (cat: string) => {
        switch (cat) {
            case 'Complexity': return <Code className="w-4 h-4" />;
            case 'Architecture': return <Layout className="w-4 h-4" />;
            case 'Security': return <Shield className="w-4 h-4" />;
            default: return <Zap className="w-4 h-4" />;
        }
    };

    return (
        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30 group hover:border-white/10 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg", getSeverityStyles(insight.severity))}>
                        {getCategoryIcon(insight.category)}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                            <Github className="w-3 h-3" /> {insight.repo}
                        </p>
                        <h3 className="font-bold text-lg group-hover:text-white transition-colors capitalize">{insight.title}</h3>
                    </div>
                </div>
                <span className={cn("text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider", getSeverityStyles(insight.severity))}>
                    {insight.severity}
                </span>
            </div>

            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                {insight.description}
            </p>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 relative overflow-hidden group/fix">
                <div className="absolute top-0 right-0 p-2 opacity-20 group-hover/fix:opacity-100 transition-opacity">
                    <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </div>
                <p className="text-[10px] uppercase font-black text-zinc-500 mb-1 tracking-tighter">AI Fix Suggestion</p>
                <p className="text-sm font-semibold text-blue-400">{insight.fix}</p>
            </div>

            <div className="mt-6 flex justify-between items-center pt-6 border-t border-white/5">
                <button className="text-xs font-bold text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                    Dismiss <AlertTriangle className="w-3 h-3" />
                </button>
                <Link href={`/repo/${insight.repo}`} className="text-xs font-bold text-white hover:text-blue-400 transition-colors flex items-center gap-1 group/btn">
                    View Context <ArrowUpRight className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-all" />
                </Link>
            </div>
        </div>
    );
}
