import { useQuery, useMutation } from "@tanstack/react-query";
import { getMonthlyReview, postMonthlyReview } from "../api/reviewApi";
import { mockMonthlyReviewData } from "../metadata/metadata.ts";
import type { MonthlyReviewPayload } from "../api/reviewApi";

export const useGetMonthlyReview = (
    userId: string,
    month: string
) => {
    return useQuery({
        queryKey: ["monthlyReview", userId, month],
        enabled: Boolean(userId && month),
        refetchOnWindowFocus: false,
        queryFn: async () => {
            if (import.meta.env.VITE_USE_MOCK === "true") {
                return {
                    ...mockMonthlyReviewData,
                    employeeId: userId,
                    month,
                };
            }

            return getMonthlyReview(userId, month);
        },
    });
};

export const usePostMonthlyReview = () => {
    return useMutation({
        mutationFn: async (payload: MonthlyReviewPayload) => {
            if (import.meta.env.VITE_USE_MOCK === "true") {
                return payload; // echo back saved data
            }

            return postMonthlyReview(payload);
        },
    });
};