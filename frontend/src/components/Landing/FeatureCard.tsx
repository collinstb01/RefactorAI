import React from "react";

export function FeatureCard({ title, description }: { title: string, description: string }) {
    return (
        <div className="p-8 rounded-2xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/50 transition-all group">
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-zinc-400 leading-relaxed">{description}</p>
        </div>
    );
}
