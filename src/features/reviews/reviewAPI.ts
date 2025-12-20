import { BASE_URL } from "../../utils/constant-value/constant";
import type { CreateCoachReviewForm, CreateFieldReviewForm } from "../../types/reviewTypes";
import axiosPrivate from "../../utils/axios/axiosPrivate";
import axiosPublic from "../../utils/axios/axiosPublic";

export const REVIEWS_API = `${BASE_URL}/reviews`;

/**
 * Gửi review cho coach
 * @param data - Thông tin review
 * @returns Review object
 */
export const createCoachReviewAPI = async (data: CreateCoachReviewForm) => {
  const response = await axiosPrivate.post(`${REVIEWS_API}/coach`, data);
  return response.data;
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

/**
 * Gửi review cho field
 * @param data - Thông tin review
 * @returns Review object
 */
export const createFieldReviewAPI = async (data: CreateFieldReviewForm) => {
  const response = await axiosPrivate.post(`${REVIEWS_API}/field`, data);
  return response.data;
};

/**
 * Fetch reviews for a field (public endpoint)
 * @param fieldId - field id
 * @param page - page number
 * @param limit - items per page
 */
export const getReviewsForFieldAPI = async (
  fieldId: string,
  page = 1,
  limit = 10
) => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  const response = await axiosPublic.get(`${REVIEWS_API}/field/${fieldId}?${params.toString()}`);
  return response.data;
};

/**
 * Fetch aggregated stats for a field (totalReviews and averageRating)
 * @param fieldId - Field id
 */
export const getFieldStatsAPI = async (fieldId: string) => {
  const response = await axiosPublic.get(`${REVIEWS_API}/field/${fieldId}/stats`);
  return response.data;
};
