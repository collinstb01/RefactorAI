import api from "@/lib/api";

export interface GitHubLoginPayload {
    github_id: string;
    name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
    github_username?: string | null;
    access_token?: string | null;
}

export interface LoginResponse {
    status: string;
    access_token?: string; // Anticipating backend JWT implementation
}

export const authService = {
    loginWithGitHub: async (payload: GitHubLoginPayload): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>("/auth/login", payload);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await api.post("/auth/logout");
    }
};
