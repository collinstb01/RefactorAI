import api from "@/lib/api";
import { getToken } from "@/lib/token";

export interface AnalysisPayload {
    repo_id: number;
    repo_name: string;
    repo_url: string;
    token: string;
    type: string;
}

export interface AnalysisResponse {
    status: string;
    analysis_id?: number;
    message?: string;
}

export interface AnalysisStatus {
    id: number;
    status: "pending" | "in_progress" | "completed" | "failed";
    analysis_type: string;
    summary: string;
    score: number | null;
    completed_at: string | null;
}

export interface AnalysisIssue {
    id: number;
    type: string;
    file_path: string;
    description: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    suggestion: string | null;
}

export interface AnalysisMetric {
    id: number;
    name: string;
    value: number;
}

export interface ArchitectureData {
    description: string;
    patterns: string[];
    recommendations: string[];
}

export interface RefactorSuggestion {
    id: number;
    title: string;
    description: string;
    impact: "low" | "medium" | "high";
}

export interface AnalysisDetail extends AnalysisStatus {
    repo_id: number;
    created_at: string;
    // type-specific fields — only one will be populated per analysis
    issues?: AnalysisIssue[];
    metrics?: AnalysisMetric[];
    architecture?: ArchitectureData | null;
    suggestions?: RefactorSuggestion[];
}

export interface AnalysisHistoryItem extends AnalysisStatus {
    repo_id: number;
    repo_name: string;
    created_at: string;
}


export const analysisService = {
    startAnalysis: async (payload: AnalysisPayload): Promise<AnalysisResponse> => {
        const response = await api.post<AnalysisResponse>("/analyze", payload);
        return response.data;
    },

    getAnalysisStatus: async (analysisId: number): Promise<AnalysisStatus> => {
        const response = await api.get<AnalysisStatus>(`/analyze/${analysisId}/status`);
        return response.data;
    },

    getAnalysisDetail: async (analysisId: number): Promise<AnalysisDetail> => {
        const response = await api.get<AnalysisDetail>(`/analyze/${analysisId}`);
        return response.data;
    },

    getRepoHistory: async (repoId: number): Promise<AnalysisDetail[]> => {
        const response = await api.get<AnalysisDetail[]>(`/analyze/history/repo/${repoId}`);
        return response.data;
    },

    getHistory: async (): Promise<AnalysisHistoryItem[]> => {
        const response = await api.get<AnalysisHistoryItem[]>("/analyze/history/all");
        return response.data;
    },
};
