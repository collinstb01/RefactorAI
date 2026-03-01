"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Shield,
    LayoutDashboard,
    Settings,
    History,
    Lightbulb,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard", href: "/dashboard" },
        { icon: <History className="w-4 h-4" />, label: "Reports", href: "/reports" },
        { icon: <Lightbulb className="w-4 h-4" />, label: "Insights", href: "/insights" },
        { icon: <Settings className="w-4 h-4" />, label: "Settings", href: "/settings" },
    ];

    return (
        <aside className="w-64 border-r border-white/5 flex flex-col p-4 fixed h-full bg-[#09090b] z-40">
            <Link href="/" className="flex items-center gap-2 mb-8 px-2">
                <span className="font-bold text-lg tracking-tight">RefactorAI</span>
            </Link>

            <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                        <div className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
                            pathname === item.href ? "bg-white/5 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
                        )}>
                            {item.icon}
                            {item.label}
                        </div>
                    </Link>
                ))}
            </nav>

            <div className="mt-auto px-2 py-4 border-t border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                    <User className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">alex_dev</p>
                    <p className="text-xs text-zinc-500 truncate">Pro Plan</p>
                </div>
            </div>
        </aside>
    );
}
