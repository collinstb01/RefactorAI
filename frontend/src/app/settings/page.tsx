"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Shield,
    LayoutDashboard,
    Settings as SettingsIcon,
    Github,
    User,
    Bell,
    Lock,
    CreditCard,
    Check,
    ChevronRight,
    Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";

export default function SettingsPage() {
    const [model, setModel] = useState("gpt-4o");

    return (
        <div className="flex min-h-screen bg-[#09090b] text-white">
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 max-w-4xl">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold mb-2">Settings</h1>
                    <p className="text-zinc-500">Manage your account, GitHub connections, and AI preferences.</p>
                </header>

                <div className="space-y-10">
                    {/* GitHub Connection */}
                    <section>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Github className="w-5 h-5 text-zinc-400" /> GitHub Connection
                        </h2>
                        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/20 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5">
                                    <Github className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold">alex_dev</p>
                                    <p className="text-xs text-zinc-500 text-emerald-400 flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Connected
                                    </p>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-all">Reconnect</button>
                        </div>
                        <p className="mt-4 text-xs text-zinc-500 px-1">
                            Granting RepoAudit access to your repositories allows us to perform deep analysis. We never store your code.
                        </p>
                    </section>

                    {/* AI Selection */}
                    <section>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-blue-400" /> AI Model Selection
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <ModelOption
                                id="gpt-4o"
                                name="GPT-4o (Premium)"
                                description="Our most accurate and detailed analysis engine."
                                active={model === "gpt-4o"}
                                onClick={() => setModel("gpt-4o")}
                            />
                            <ModelOption
                                id="claude-3"
                                name="Claude 3.5 Sonnet"
                                description="Optimized for large codebase architectural patterns."
                                active={model === "claude-3"}
                                onClick={() => setModel("claude-3")}
                            />
                        </div>
                    </section>

                    {/* Account Settings */}
                    <section>
                        <h2 className="text-lg font-semibold mb-4">Account</h2>
                        <div className="rounded-2xl border border-white/5 bg-zinc-900/20 divide-y divide-white/5">
                            <SettingsLink icon={<User className="w-4 h-4" />} title="Personal Information" />
                            <SettingsLink icon={<Bell className="w-4 h-4" />} title="Notifications" />
                            <SettingsLink icon={<Lock className="w-4 h-4" />} title="Security & API Keys" />
                            <SettingsLink icon={<CreditCard className="w-4 h-4" />} title="Billing & Subscription" />
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <div className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
            active ? "bg-white/5 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
        )}>
            {icon}
            {label}
        </div>
    );
}

function ModelOption({ id, name, description, active, onClick }: { id: string, name: string, description: string, active: boolean, onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "p-5 rounded-2xl border transition-all cursor-pointer",
                active ? "bg-blue-500/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]" : "bg-zinc-900/20 border-white/5 hover:border-white/10"
            )}
        >
            <div className="flex justify-between items-center mb-2">
                <p className={cn("font-bold text-sm transition-colors", active ? "text-blue-400" : "text-white")}>{name}</p>
                {active && <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                </div>}
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
        </div>
    );
}

function SettingsLink({ icon, title }: { icon: React.ReactNode, title: string }) {
    return (
        <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                    {icon}
                </div>
                <p className="text-sm font-medium group-hover:text-white transition-colors">{title}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-all" />
        </div>
    );
}
