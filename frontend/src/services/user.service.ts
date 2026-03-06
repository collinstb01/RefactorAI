import api from "@/lib/api";

export interface UserResponse {
    id: number;
    username: string;
    email: string;
    avatar_url: string;
    created_at: string;
}

export interface UpdateUserPayload {
    username?: string;
    email?: string;
    avatar_url?: string;
}

export const userService = {
    getMe: async (): Promise<UserResponse> => {
        const response = await api.get<UserResponse>("/users/me");
        return response.data;
    },

    updateMe: async (data: UpdateUserPayload): Promise<UserResponse> => {
        const response = await api.patch<UserResponse>("/users/me", data);
        return response.data;
    },
};
