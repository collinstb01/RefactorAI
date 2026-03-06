"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Settings,
    History,
    Lightbulb,
    User,
    LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { authService } from "@/services/auth.service";
import { removeToken } from "@/lib/token";
import { useCurrentUser } from "@/query/user.query";

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { data: currentUser } = useCurrentUser();

    const navItems = [
        { icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard", href: "/dashboard" },
        { icon: <History className="w-4 h-4" />, label: "History", href: "/history" },
        { icon: <Lightbulb className="w-4 h-4" />, label: "Insights", href: "/insights" },
        { icon: <Settings className="w-4 h-4" />, label: "Settings", href: "/settings" },
    ];

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Backend logout failed", error);
        } finally {
            removeToken();
            signOut({ callbackUrl: "/" });
        }
    };

    // Prefer API data, fall back to NextAuth session
    const displayName = currentUser?.username || (session?.user as any)?.github_username || session?.user?.name || "User";
    const avatarUrl = currentUser?.avatar_url || session?.user?.image;

    return (
        <aside className="w-64 border-r border-white/5 flex flex-col p-4 fixed h-full bg-[#09090b] z-40">
            <Link href="/" className="flex items-center gap-2 mb-8 px-2 transition-opacity hover:opacity-80">
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
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-4 h-4 text-zinc-400" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{displayName}</p>
                    {currentUser?.email && (
                        <p className="text-[10px] text-zinc-500 truncate">{currentUser.email}</p>
                    )}
                </div>
                <button
                    onClick={handleLogout}
                    title="Sign out"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all ml-auto"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        </aside>
    );
}
