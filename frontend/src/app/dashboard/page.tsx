"use client";

import { useState } from "react";
import {
    Search,
    Github,
    Clock,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { RepoCard } from "@/components/RepoCard";
import { useCurrentUser } from "@/query/user.query";
import { useRepositories } from "@/query/repo.query";

export default function DashboardPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const { data: currentUser } = useCurrentUser();
    const { data: repos = [], isLoading, isFetching, refetch } = useRepositories();

    const filteredRepos = repos.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-[#09090b] text-white">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">
                            {currentUser ? `Welcome, ${currentUser.username} 👋` : "Repositories"}
                        </h1>
                        <p className="text-zinc-400 text-sm">Monitor and analyze your codebase health.</p>
                    </div>
                    <button
                        onClick={async () => {
                            await refetch();
                            toast.success("Repositories synced from GitHub!");
                        }}
                        disabled={isFetching}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                        {isFetching ? "Syncing..." : "Sync Repos"}
                    </button>
                </header>

                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <StatCard label="Total Repos" value={String(repos.length || "—")} icon={<Github className="w-4 h-4" />} />
                    <StatCard label="Private Repos" value={String(repos.filter(r => r.private).length || "—")} icon={<AlertCircle className="w-4 h-4" />} />
                    <StatCard label="Latest Sync" value={repos.length ? "Just now" : "Never"} icon={<Clock className="w-4 h-4" />} />
                </div>

                {/* Search */}
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
                {isLoading ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30 animate-pulse h-52" />
                        ))}
                    </div>
                ) : filteredRepos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
                        <Github className="w-12 h-12 mb-4 opacity-30" />
                        <p className="text-sm font-medium">No repositories found.</p>
                        <p className="text-xs mt-1">Click &quot;Sync Repos&quot; to fetch from GitHub.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {filteredRepos.map((repo) => (
                            <RepoCard
                                key={repo.id}
                                repo={repo}
                                history={repo.analysis_history || []}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}


