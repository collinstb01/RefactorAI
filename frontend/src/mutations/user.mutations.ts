import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, UpdateUserPayload } from "@/services/user.service";

export const useUpdateMe = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateUserPayload) => userService.updateMe(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users", "me"] });
        },
    });
};
