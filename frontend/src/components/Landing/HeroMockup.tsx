import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function HeroMockup() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-20 w-full max-w-6xl mx-auto px-4"
        >
            <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-2 glass">
                <div className="rounded-lg bg-[#09090b] border border-white/5 overflow-hidden flex aspect-video shadow-2xl relative">
                    {/* Mock Sidebar */}
                    <div className="w-40 border-r border-white/5 p-4 flex flex-col gap-6 scale-90 origin-top-left hidden md:flex">
                        <div className="font-bold text-[10px] tracking-tight px-2 opacity-40 uppercase">RefactorAI</div>
                        <div className="space-y-1">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={cn("h-7 rounded px-2 flex items-center gap-2", i === 1 ? "bg-white/10 text-white" : "text-zinc-500 opacity-50")}>
                                    <div className="w-3 h-3 bg-current rounded-sm opacity-20" />
                                    <div className="w-12 h-1.5 bg-current rounded-full opacity-20" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mock Main Content */}
                    <div className="flex-1 p-6 text-left overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />

                        <div className="flex justify-between items-center mb-6">
                            <div className="space-y-2">
                                <div className="w-24 h-5 bg-white/10 rounded" />
                                <div className="w-40 h-2 bg-white/5 rounded" />
                            </div>
                            <div className="w-24 h-8 bg-white text-black rounded text-[10px] font-bold flex items-center justify-center tracking-tighter cursor-default">+ CONNECT</div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-14 rounded-lg border border-white/5 bg-white/[0.02] p-3 flex flex-col justify-between">
                                    <div className="w-8 h-1.5 bg-white/5 rounded" />
                                    <div className="w-12 h-3 bg-white/10 rounded" />
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[1, 2].map(i => (
                                <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col justify-between h-32">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-2">
                                            <div className="w-8 h-8 rounded-md bg-zinc-800 border border-white/5" />
                                            <div className="space-y-1.5">
                                                <div className="w-20 h-3 bg-white/10 rounded" />
                                                <div className="w-12 h-1.5 bg-white/5 rounded" />
                                            </div>
                                        </div>
                                        <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] text-emerald-500 font-bold">HEALTHY</div>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <div className="flex -space-x-1">
                                            {[1, 2, 3].map(j => <div key={j} className="w-4 h-4 rounded-full bg-zinc-800 border border-black shadow-sm" />)}
                                        </div>
                                        <div className="w-16 h-6 bg-zinc-800 rounded-md border border-white/5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
