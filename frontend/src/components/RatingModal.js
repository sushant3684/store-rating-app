import React, { useState } from 'react';
import { userAPI } from '../services/api';
import { toast } from 'react-toastify';

const RatingModal = ({ store, onClose, onSuccess }) => {
  const [rating, setRating] = useState(store.user_rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('select a rating');
      return;
    }

    setLoading(true);

    try {
      await userAPI.submitRating({
        storeId: store.id,
        rating: rating
      });
      toast.success(store.user_rating ? 'rating updated' : 'rating added');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Rate {store.name}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Rating</label>
            <div className="rating-input">
              {[1, 2, 3, 4, 5].map(i => (
                <span
                  key={i}
                  className={`star ${i <= (hoveredRating || rating) ? '' : 'empty'}`}
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHoveredRating(i)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  ★
                </span>
              ))}
              <span style={{ marginLeft: '10px', fontSize: '18px', fontWeight: '600' }}>
                {rating > 0 ? `${rating}/5` : 'pick rating'}
              </span>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-submit" disabled={loading || rating === 0}>
              {loading ? 'saving...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
