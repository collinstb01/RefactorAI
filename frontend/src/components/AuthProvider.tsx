"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import { setToken, removeToken } from "@/lib/token";

function TokenSync() {
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.accessToken) {
            setToken(session.accessToken);
        }
    }, [session]);

    return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <TokenSync />
            {children}
        </SessionProvider>
    );
}
