import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ownerAPI } from '../../services/api';
import { toast } from 'react-toastify';
import '../../styles/App.css';
import UpdatePasswordModal from '../../components/UpdatePasswordModal';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await ownerAPI.getDashboard();
      setDashboard(response.data.data);
      if (response.data.data.stores.length > 0) {
        loadStoreRatings(response.data.data.stores[0].id);
        setSelectedStore(response.data.data.stores[0]);
      }
    } catch (error) {
      toast.error('Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadStoreRatings = async (storeId) => {
    try {
      const response = await ownerAPI.getStoreRatings(storeId);
      setRatings(response.data.data.ratings);
    } catch (error) {
      toast.error('Error loading ratings');
    }
  };

  const handleStoreChange = (store) => {
    setSelectedStore(store);
    loadStoreRatings(store.id);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="loading">Loading...</div>;

  if (!dashboard || dashboard.stores.length === 0) {
    return (
      <div className="dashboard">
        <nav className="navbar">
          <h2>Owner Dashboard</h2>
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
          <div className="empty-state">
            <p>No stores assigned to your account. Please contact an administrator.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>Owner Dashboard</h2>
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
        {dashboard.stores.length > 1 && (
          <div className="data-section">
            <h3>Select Store</h3>
            <div className="filters">
              <select
                value={selectedStore?.id}
                onChange={(e) => {
                  const store = dashboard.stores.find(s => s.id === parseInt(e.target.value));
                  handleStoreChange(store);
                }}
              >
                {dashboard.stores.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {selectedStore && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Store Name</h3>
                <div className="value" style={{ fontSize: '20px' }}>{selectedStore.name}</div>
              </div>
              <div className="stat-card">
                <h3>Average Rating</h3>
                <div className="value">{selectedStore.average_rating} ★</div>
              </div>
              <div className="stat-card">
                <h3>Total Ratings</h3>
                <div className="value">{selectedStore.total_ratings}</div>
              </div>
            </div>

            <div className="data-section">
              <h3>Customer Ratings</h3>
              {ratings.length > 0 ? (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Customer Name</th>
                        <th>Email</th>
                        <th>Rating</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ratings.map(rating => (
                        <tr key={rating.id}>
                          <td>{rating.user_name}</td>
                          <td>{rating.user_email}</td>
                          <td>
                            <div className="rating-display">
                              {[1, 2, 3, 4, 5].map(i => (
                                <span key={i} className={`star ${i <= rating.rating ? '' : 'empty'}`}>★</span>
                              ))}
                            </div>
                          </td>
                          <td>{new Date(rating.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <p>No ratings yet for this store</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showPasswordModal && (
        <UpdatePasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSuccess={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
};

export default OwnerDashboard;
