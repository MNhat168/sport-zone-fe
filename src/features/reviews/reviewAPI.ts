import { BASE_URL } from "../../utils/constant-value/constant";
import type { CreateCoachReviewForm } from "../../types/reviewTypes";

export const REVIEWS_API = `${BASE_URL}/reviews`;

/**
 * Gửi review cho coach
 * @param data - Thông tin review
 * @returns Review object
 */
export const createCoachReviewAPI = async (data: CreateCoachReviewForm) => {
  const response = await fetch(`${REVIEWS_API}/coach`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
};

/**
 * Fetch reviews for a coach (public endpoint)
 * @param coachId - coach id
 */
export const getReviewsForCoachAPI = async (
  coachId: string,
  page = 1,
  limit = 10
) => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  const response = await fetch(`${REVIEWS_API}/coach/${coachId}?${params.toString()}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
};
