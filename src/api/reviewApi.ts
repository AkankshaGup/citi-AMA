import {api} from "../config/axiosInstance"; // your axios instance

export interface MonthlyReviewPayload {
  employeeId: string;
  month: string; // YYYY-MM-DD
  whatWentWell: string;
  improvementsNeeded: string;
  blockersChallenges: string;
  thingsToTry: string;
  clientAppreciation: string;
  keyAchievements: string;
}

export interface MonthlyReviewResponse {
  employeeId: string;
  month: string;
  whatWentWell: string;
  improvementsNeeded: string;
  blockersChallenges: string;
  thingsToTry: string;
  clientAppreciation: string;
  keyAchievements: string;
}
// 🔹 POST - Save Monthly Review
export const postMonthlyReview = async (
  payload: MonthlyReviewPayload
): Promise<MonthlyReviewResponse> => {
  const res = await api.post("/public/monthly_review", payload);
  return res.data;
};

// 🔹 GET - Fetch Monthly Review
export const getMonthlyReview = async (
  userId: string,
  month: string
): Promise<MonthlyReviewResponse> => {
  const res = await api.get("/public/monthly_review", {
    params: { userId, month },
  });
  return res.data;
};