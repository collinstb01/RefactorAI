import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
        user: {
            github_username?: string;
            accessToken?: string;
        } & DefaultSession["user"];
    }

    interface User {
        accessToken?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        github_username?: string;
    }
}
