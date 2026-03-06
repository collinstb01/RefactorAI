import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import { getToken } from "@/lib/token";

export const useCurrentUser = () => {
    return useQuery({
        queryKey: ["users", "me"],
        queryFn: () => userService.getMe(),
        // Only run if there's a token stored locally
        enabled: !!getToken(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false,
    });
};
