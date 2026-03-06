import api from "@/lib/api";

import { AnalysisHistoryItem } from "./analysis.service";

export interface Repository {
    id: number;
    github_repo_id: number;
    name: string;
    full_name: string;
    private: boolean;
    default_branch: string;
    repo_url: string;
    created_at: string;
    latest_analysis_id?: number;
    latest_analysis_status?: string;
    latest_analysis_score?: number;
    analysis_history?: AnalysisHistoryItem[];
}

export const repoService = {
    getRepos: async (): Promise<Repository[]> => {
        const response = await api.get<Repository[]>("/repos");
        return response.data;
    },
};
