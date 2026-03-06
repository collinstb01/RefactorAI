import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { authService } from "@/services/auth.service";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],

    callbacks: {
        /**
         * After a successful sign-in, forward the GitHub profile to the backend.
         * The backend stores / upserts the user and can return extra data later.
         */
        async signIn({ user, account, profile }) {
            if (account?.provider === "github") {
                try {
                    const data = await authService.loginWithGitHub({
                        github_id: String(profile?.id),
                        name: user.name ?? undefined,
                        email: user.email ?? undefined,
                        avatar_url: user.image ?? undefined,
                        github_username: (profile as any)?.login,
                        access_token: account?.access_token,
                    });

                    if (data.access_token) {
                        (user as any).accessToken = data.access_token;
                    }
                } catch (err) {
                    console.warn("[auth] backend login sync failed:", err);
                }
            }
            return true;
        },

        /** Expose user info and token to the client session */
        async session({ session, token }) {
            if (token) {
                (session as any).accessToken = token.accessToken;
                if (session.user) {
                    (session.user as any).github_username = token.github_username;
                    (session.user as any).accessToken = token.accessToken;
                }
            }
            return session;
        },

        async jwt({ token, user, profile }) {
            if (user) {
                token.accessToken = (user as any).accessToken;
            }
            if (profile) {
                token.github_username = (profile as any).login;
            }
            return token;
        },
    },
});
