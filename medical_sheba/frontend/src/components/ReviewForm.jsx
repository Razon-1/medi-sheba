import { useState } from 'react';
import { Star, AlertCircle } from 'lucide-react';
import { reviewsAPI } from '../api/reviews';
import '../styles/components/ReviewForm.css';

export default function ReviewForm({ doctorId, onReviewSubmitted, onCancel }) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reviewText.trim()) {
      setError('Please write a review');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await reviewsAPI.create({
        doctor_id: parseInt(doctorId),
        rating: parseInt(rating),
        title: title || null,
        review_text: reviewText.trim(),
      });

      // Success - reset form and notify parent
      setRating(5);
      setTitle('');
      setReviewText('');
      onReviewSubmitted();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Failed to submit review. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Your Rating *</label>
        <div className="rating-picker">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star-btn ${rating >= star ? 'active' : ''}`}
              onClick={() => setRating(star)}
            >
              <Star
                size={32}
                fill={rating >= star ? '#FFA500' : '#ddd'}
                color={rating >= star ? '#FFA500' : '#ddd'}
              />
            </button>
          ))}
        </div>
        <p className="rating-text">{rating} out of 5 stars</p>
      </div>

      <div className="form-group">
        <label htmlFor="title">Review Title (Optional)</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Excellent Doctor, Very Professional"
          maxLength={200}
        />
        <p className="char-count">{title.length}/200</p>
      </div>

      <div className="form-group">
        <label htmlFor="reviewText">Your Review *</label>
        <textarea
          id="reviewText"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience with this doctor..."
          rows="5"
          maxLength={1000}
        />
        <p className="char-count">{reviewText.length}/1000</p>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
}
