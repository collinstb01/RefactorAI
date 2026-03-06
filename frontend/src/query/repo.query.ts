import { useQuery } from "@tanstack/react-query";
import { repoService } from "@/services/repo.service";
import { getToken } from "@/lib/token";

export const useRepositories = () => {
    return useQuery({
        queryKey: ["repos"],
        queryFn: () => repoService.getRepos(),
        enabled: !!getToken(),
        staleTime: 1000 * 60 * 2, // 2 minutes — repos refresh fairly often
    });
};
