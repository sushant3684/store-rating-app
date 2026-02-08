import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { toast } from 'react-toastify';
import '../../styles/App.css';
import RatingModal from '../../components/RatingModal';
import UpdatePasswordModal from '../../components/UpdatePasswordModal';

const UserStores = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    address: '',
    sortBy: 'name',
    sortOrder: 'ASC',
  });

  useEffect(() => {
    fetchStores();
  }, [filters]);

  const fetchStores = async () => {
    try {
      const response = await userAPI.getStores(filters);
      setStores(response.data.data);
    } catch (error) {
      toast.error('Error loading stores');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRateStore = (store) => {
    setSelectedStore(store);
    setShowRatingModal(true);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>Stores</h2>
        <div className="navbar-right">
          <div className="user-info">
            <div className="name">{user?.name}</div>
            <div className="role">{user?.role}</div>
          </div>
          <button onClick={() => setShowPasswordModal(true)} className="btn-secondary">Change Password</button>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="main-content">
        <div className="data-section">
          <div className="section-header">
            <h3>Browse Stores</h3>
          </div>
          <div className="filters">
            <div className="filter-group">
              <label>Search by Name</label>
              <input
                type="text"
                placeholder="Enter store name"
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              />
            </div>
            <div className="filter-group">
              <label>Search by Address</label>
              <input
                type="text"
                placeholder="Enter address"
                value={filters.address}
                onChange={(e) => setFilters({ ...filters, address: e.target.value })}
              />
            </div>
            <div className="filter-group">
              <label>Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              >
                <option value="name">Name</option>
                <option value="address">Address</option>
                <option value="overall_rating">Rating</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
              >
                <option value="ASC">Ascending</option>
                <option value="DESC">Descending</option>
              </select>
            </div>
          </div>

          <div className="stores-grid">
            {stores.map(store => (
              <div key={store.id} className="store-card">
                <h4>{store.name}</h4>
                <p>📍 {store.address || 'No address provided'}</p>
                <div className="store-rating">
                  <div className="rating-display">
                    {[1, 2, 3, 4, 5].map(i => (
                      <span key={i} className={`star ${i <= store.overall_rating ? '' : 'empty'}`}>★</span>
                    ))}
                  </div>
                  <span>({store.overall_rating} avg, {store.total_ratings} ratings)</span>
                </div>
                {store.user_rating && (
                  <p style={{ color: '#3498db', fontWeight: '600' }}>
                    Your rating: {store.user_rating} ★
                  </p>
                )}
                <div className="store-actions">
                  <button
                    onClick={() => handleRateStore(store)}
                    className={`btn-small ${store.user_rating ? 'btn-update' : 'btn-rate'}`}
                  >
                    {store.user_rating ? 'Update Rating' : 'Rate Store'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {stores.length === 0 && (
            <div className="empty-state">
              <p>No stores found</p>
            </div>
          )}
        </div>
      </div>

      {showRatingModal && (
        <RatingModal
          store={selectedStore}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedStore(null);
          }}
          onSuccess={() => {
            setShowRatingModal(false);
            setSelectedStore(null);
            fetchStores();
          }}
        />
      )}

      {showPasswordModal && (
        <UpdatePasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSuccess={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
};

export default UserStores;
