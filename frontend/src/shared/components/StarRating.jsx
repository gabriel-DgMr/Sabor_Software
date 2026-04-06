import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import '../styles/starRating.css';

const StarRating = ({
  rating = 0,
  onRatingChange,
  readonly = false,
  size = 20,
  showNumber = true,
}) => {
  const [hover, setHover] = useState(0);

  const handleClick = ratingValue => {
    if (!readonly && onRatingChange) {
      onRatingChange(ratingValue);
    }
  };

  const handleMouseEnter = ratingValue => {
    if (!readonly) {
      setHover(ratingValue);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHover(0);
    }
  };

  return (
    <div className={`star-rating ${readonly ? 'readonly' : 'interactive'}`}>
      <div className="stars">
        {[...Array(5)].map((_, index) => {
          const ratingValue = index + 1;
          return (
            <FaStar
              key={index}
              className={`star ${ratingValue <= (hover || rating) ? 'filled' : 'empty'}`}
              size={size}
              onClick={() => handleClick(ratingValue)}
              onMouseEnter={() => handleMouseEnter(ratingValue)}
              onMouseLeave={handleMouseLeave}
              style={{
                cursor: readonly ? 'default' : 'pointer',
                transition: 'color 0.2s ease',
              }}
            />
          );
        })}
      </div>
      {showNumber && rating > 0 && <span className="rating-number">{rating.toFixed(1)}</span>}
    </div>
  );
};

export default StarRating;
