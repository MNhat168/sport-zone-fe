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
   * Coach ID being reviewed
   */
  coachId: string;
  /**
   * Booking ID associated with the review
   */
  bookingId: string;
}
