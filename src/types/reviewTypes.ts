/**
 * Form data for creating a coach review
 */
export interface CreateCoachReviewForm {
  /**
   * Review type (must be 'coach')
   */
  type: 'coach';
  /**
   * Rating from 1 to 5
   */
  rating: number;
  /**
   * Review comment
   */
  comment: string;
  /**
   * Optional review title
   */
  title?: string;
  /**
   * Coach ID being reviewed
   */
  coachId: string;
  /**
   * Booking ID associated with the review
   */
  bookingId: string;
}

/**
 * Form data for creating a field review
 */
export interface CreateFieldReviewForm {
  /**
   * Review type (must be 'field')
   */
  type: 'field';
  /**
   * Rating from 1 to 5
   */
  rating: number;
  /**
   * Review comment
   */
  comment: string;
  /**
   * Optional review title
   */
  title?: string;
  /**
   * Field ID being reviewed
   */
  fieldId: string;
  /**
   * Booking ID associated with the review (optional)
   */
  bookingId: string;
}

/**
 * Aggregated stats for a field or coach
 */
export interface FieldStats {
  totalReviews: number;
  averageRating: number;
}

/**
 * Aggregated stats for a coach (same shape as FieldStats)
 */
export interface CoachStats {
  totalReviews: number;
  averageRating: number;
}
