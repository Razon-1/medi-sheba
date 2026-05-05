import { useState } from 'react';
import { Star, ThumbsUp, AlertCircle } from 'lucide-react';
import { reviewsAPI } from '../api/reviews';
import '../styles/components/ReviewList.css';

export default function ReviewList({ reviews, doctorId, onReviewMarkedHelpful }) {
  const [markingHelpful, setMarkingHelpful] = useState(null);

  const handleMarkHelpful = async (reviewId) => {
    try {
      setMarkingHelpful(reviewId);
      await reviewsAPI.markHelpful(reviewId);
      onReviewMarkedHelpful();
    } catch (err) {
      console.error('Error marking review as helpful:', err);
    } finally {
      setMarkingHelpful(null);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <div className="review-list">
      {reviews.map((review) => (
        <div key={review.id} className="review-item">
          <div className="review-header">
            <div className="reviewer-info">
              <h4>{review.patient_name}</h4>
              <p className="review-date">{formatDate(review.created_at)}</p>
            </div>

            <div className="review-rating">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < review.rating ? '#FFA500' : '#ddd'}
                  color={i < review.rating ? '#FFA500' : '#ddd'}
                />
              ))}
            </div>
          </div>

          {review.title && <h5 className="review-title">{review.title}</h5>}

          {review.is_verified_patient && (
            <div className="verified-badge">
              <AlertCircle size={14} />
              Verified Patient
            </div>
          )}

          <p className="review-text">{review.review_text}</p>

          <div className="review-footer">
            <button
              className="helpful-btn"
              onClick={() => handleMarkHelpful(review.id)}
              disabled={markingHelpful === review.id}
            >
              <ThumbsUp size={16} />
              Helpful ({review.helpful_count})
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
