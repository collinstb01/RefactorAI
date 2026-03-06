"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { analysisService } from "@/services/analysis.service";
import { getToken } from "@/lib/token";
import { toast } from "sonner";

export function AnalyzeButton({
    label,
    analysisType,
    repoId,
    repoName,
    repoUrl,
    onSuccess,
}: {
    label: string;
    analysisType: string;
    repoId: number;
    repoName: string;
    repoUrl: string;
    onSuccess: (analysisId: number) => void;
}) {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            const res = await analysisService.startAnalysis({
                repo_id: repoId,
                repo_name: repoName,
                repo_url: repoUrl,
                token: getToken() || "",
                type: analysisType,
            });
            if (res.analysis_id) {
                onSuccess(res.analysis_id);
                toast.success(`Analysis ${analysisType} started!`);
            }
        } catch (e: unknown) {
            const axiosError = e as { response?: { data?: { detail?: unknown } } };
            const detail = axiosError?.response?.data?.detail;
            const msg = typeof detail === "string"
                ? detail
                : Array.isArray(detail)
                    ? detail.map((d: { msg?: string }) => d.msg || "").join(", ")
                    : "Failed to trigger analysis. Please try again.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-3 py-10">
            <button
                onClick={handleClick}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-zinc-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-4 h-4" />
                        {label}
                    </>
                )}
            </button>
        </div>
    );
}
