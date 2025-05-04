// src/components/Reviews/ReviewsList.jsx
import React, { useState } from 'react';

const ReviewsList = ({ reviews }) => {
  const [showAll, setShowAll] = useState(false);

  if (!reviews) return null;

  const visibleReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <div className="reviews-section">
      <h3>Sentiment Analysis Reviews</h3>
      {visibleReviews.map((review, idx) => (
        <div key={idx} className={`review-card ${review.sentiment}`}>
          <p>{review.review_text}</p>
          <small>Sentiment: {review.sentiment}</small>
        </div>
      ))}
      {reviews.length > 3 && (
        <button className="btn" onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show Less' : 'Show All'}
        </button>
      )}
    </div>
  );
};

export default ReviewsList;
