"use client";

import { useState } from "react";
import {
    Github,
    Check,
    Cpu,
    Pencil,
    X,
    Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
import { useCurrentUser } from "@/query/user.query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user.service";

export default function SettingsPage() {
    const { data: currentUser, isLoading } = useCurrentUser();
    const queryClient = useQueryClient();
    const [model] = useState("gpt-4o");
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({ username: "", email: "" });

    const updateMutation = useMutation({
        mutationFn: userService.updateMe,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users", "me"] });
            setEditing(false);
        },
    });

    const startEdit = () => {
        setFormData({
            username: currentUser?.username || "",
            email: currentUser?.email || "",
        });
        setEditing(true);
    };

    const handleSave = () => {
        updateMutation.mutate(formData);
    };

    return (
        <div className="flex min-h-screen bg-[#09090b] text-white">
            <Sidebar />

            <main className="flex-1 ml-64 p-8 max-w-4xl">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold mb-2">Settings</h1>
                    <p className="text-zinc-500">Manage your account, GitHub connections, and AI preferences.</p>
                </header>

                <div className="space-y-10">
                    {/* Profile Section */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Profile</h2>
                            {!editing ? (
                                <button
                                    onClick={startEdit}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-all"
                                >
                                    <Pencil className="w-3 h-3" /> Edit
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditing(false)}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-all"
                                    >
                                        <X className="w-3 h-3" /> Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={updateMutation.isPending}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-medium transition-all"
                                    >
                                        <Save className="w-3 h-3" />
                                        {updateMutation.isPending ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/20">
                            <div className="flex items-center gap-5 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-white/5 overflow-hidden">
                                    {currentUser?.avatar_url ? (
                                        <img src={currentUser.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-500 text-2xl font-bold">
                                            {currentUser?.username?.[0]?.toUpperCase() ?? "?"}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xl font-bold">{currentUser?.username ?? "—"}</p>
                                    <p className="text-sm text-zinc-500">{currentUser?.email ?? "—"}</p>
                                    {currentUser?.created_at && (
                                        <p className="text-[10px] text-zinc-600 mt-1">
                                            Member since {new Date(currentUser.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {editing && (
                                <div className="space-y-4 border-t border-white/5 pt-6">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2 block">Username</label>
                                        <input
                                            value={formData.username}
                                            onChange={(e) => setFormData(p => ({ ...p, username: e.target.value }))}
                                            className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2 block">Email</label>
                                        <input
                                            value={formData.email}
                                            onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                                            className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* GitHub Connection */}
                    <section>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Github className="w-5 h-5 text-zinc-400" /> GitHub Connection
                        </h2>
                        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/20 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5 overflow-hidden">
                                    {currentUser?.avatar_url ? (
                                        <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <Github className="w-6 h-6" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold">{currentUser?.username ?? "—"}</p>
                                    <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                                        <Check className="w-3 h-3" /> Connected
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-zinc-600 px-1">
                            Your GitHub account is connected. RefactorAI reads your repositories to perform analysis. We never store your source code.
                        </p>
                    </section>

                    {/* AI Selection */}
                    <section>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-blue-400" /> AI Model Selection
                            <span className="text-xs font-normal text-zinc-500 bg-white/5 px-2 py-1 rounded-full border border-white/5">Coming Soon</span>
                        </h2>
                        <div className="grid grid-cols-2 gap-4 opacity-40 pointer-events-none">
                            <ModelOption id="gpt-4o" name="GPT-4o" description="Most accurate and detailed analysis engine." active={model === "gpt-4o"} onClick={() => { }} />
                            <ModelOption id="claude-3" name="Claude 3.5 Sonnet" description="Optimized for large codebase architectural patterns." active={model === "claude-3"} onClick={() => { }} />
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

function ModelOption({ id, name, description, active, onClick }: { id: string; name: string; description: string; active: boolean; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "p-5 rounded-2xl border transition-all cursor-pointer",
                active ? "bg-blue-500/10 border-blue-500" : "bg-zinc-900/20 border-white/5"
            )}
        >
            <p className={cn("font-bold text-sm mb-1", active ? "text-blue-400" : "text-white")}>{name}</p>
            <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
        </div>
    );
}
