"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Shield,
    Search,
    Github,
    Plus,
    BarChart3,
    Clock,
    AlertCircle,
    Settings,
    LayoutDashboard,
    User,
    ArrowRight,
    History,
    Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";

const DUMMY_REPOS = [
    { id: 1, name: "next-js-commerce", lastAnalyzed: "2 days ago", techDebt: 12, status: "Healthy" },
    { id: 2, name: "repo-audit-dashboard", lastAnalyzed: "5 hours ago", techDebt: 45, status: "Warning" },
    { id: 3, name: "ai-scanner-v2", lastAnalyzed: "1 week ago", techDebt: 82, status: "Critical" },
    { id: 4, name: "infrastructure-as-code", lastAnalyzed: "Never", techDebt: 0, status: "Unanalyzed" },
];

export default function DashboardPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredRepos = DUMMY_REPOS.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-[#09090b] text-white">
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">Repositories</h1>
                        <p className="text-zinc-400 text-sm">Monitor and analyze your codebase health.</p>
                    </div>
                    <button className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-zinc-200 transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Connect Repository
                    </button>
                </header>

                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <StatCard label="Total Repos" value="12" icon={<Github className="w-4 h-4" />} />
                    <StatCard label="Avg Tech Debt" value="38%" icon={<AlertCircle className="w-4 h-4" />} />
                    <StatCard label="Latest Scan" value="2h ago" icon={<Clock className="w-4 h-4" />} />
                </div>

                {/* Search and Filters */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search repositories..."
                        className="w-full bg-zinc-900/50 border border-white/5 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Repo Cards Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {filteredRepos.map((repo) => (
                        <RepoCard key={repo.id} repo={repo} />
                    ))}
                </div>
            </main>
        </div>
    );
}


function StatCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/20">
            <div className="flex items-center gap-2 text-zinc-500 text-xs mb-2">
                {icon} {label}
            </div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    );
}

function RepoCard({ repo }: { repo: any }) {
    const getScoreColor = (score: number) => {
        if (score < 20) return "text-green-500 bg-green-500/10";
        if (score < 50) return "text-yellow-500 bg-yellow-500/10";
        return "text-red-500 bg-red-500/10";
    };

    return (
        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/50 transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/5">
                        <Github className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                        <h3 className="font-bold group-hover:text-blue-400 transition-colors">{repo.name}</h3>
                        <p className="text-xs text-zinc-500">Last analyzed {repo.lastAnalyzed}</p>
                    </div>
                </div>
                <div className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider", getScoreColor(repo.techDebt))}>
                    Debt Score: {repo.techDebt}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-[#09090b] flex items-center justify-center text-[10px] text-zinc-500">
                            {i}
                        </div>
                    ))}
                    <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-[#09090b] flex items-center justify-center text-[10px] text-zinc-500">
                        +
                    </div>
                </div>

                <Link
                    href={`/repo/${repo.id}`}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                >
                    Analyze <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
        </div>
    );
}
