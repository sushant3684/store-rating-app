import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import '../../styles/App.css';
import AddUserModal from '../../components/AddUserModal';
import AddStoreModal from '../../components/AddStoreModal';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddStore, setShowAddStore] = useState(false);
  const [filters, setFilters] = useState({
    storeName: '',
    storeEmail: '',
    storeAddress: '',
    userName: '',
    userEmail: '',
    userAddress: '',
    userRole: '',
    sortBy: 'name',
    sortOrder: 'ASC',
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      const userParams = {
        name: filters.userName,
        email: filters.userEmail,
        address: filters.userAddress,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };
      if (filters.userRole) {
        userParams.role = filters.userRole;
      }

      const [statsRes, storesRes, usersRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getStores({
          name: filters.storeName,
          email: filters.storeEmail,
          address: filters.storeAddress,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder
        }),
        adminAPI.getUsers(userParams),
      ]);

      setStats(statsRes.data.data);
      setStores(storesRes.data.data);
      setUsers(usersRes.data.data);
    } catch (error) {
      toast.error('error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>Admin Dashboard</h2>
        <div className="navbar-right">
          <div className="user-info">
            <div className="name">{user?.name}</div>
            <div className="role">{user?.role}</div>
          </div>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="main-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <div className="value">{stats?.totalUsers || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Total Stores</h3>
            <div className="value">{stats?.totalStores || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Total Ratings</h3>
            <div className="value">{stats?.totalRatings || 0}</div>
          </div>
        </div>

        <div className="data-section">
          <div className="section-header">
            <h3>Stores</h3>
            <button onClick={() => setShowAddStore(true)} className="btn">+ Add Store</button>
          </div>
          <div className="filters">
            <div className="filter-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="Filter by name"
                value={filters.storeName}
                onChange={(e) => setFilters({ ...filters, storeName: e.target.value })}
              />
            </div>
            <div className="filter-group">
              <label>Email</label>
              <input
                type="text"
                placeholder="Filter by email"
                value={filters.storeEmail}
                onChange={(e) => setFilters({ ...filters, storeEmail: e.target.value })}
              />
            </div>
            <div className="filter-group">
              <label>Address</label>
              <input
                type="text"
                placeholder="Filter by address"
                value={filters.storeAddress}
                onChange={(e) => setFilters({ ...filters, storeAddress: e.target.value })}
              />
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>Name {filters.sortBy === 'name' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('email')}>Email {filters.sortBy === 'email' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('address')}>Address {filters.sortBy === 'address' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}</th>
                  <th>Owner</th>
                  <th onClick={() => handleSort('rating')}>Rating {filters.sortBy === 'rating' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(store => (
                  <tr key={store.id}>
                    <td>{store.name}</td>
                    <td>{store.email}</td>
                    <td>{store.address || 'N/A'}</td>
                    <td>{store.owner_name || 'N/A'}</td>
                    <td>
                      <div className="rating-display">
                        {[1, 2, 3, 4, 5].map(i => (
                          <span key={i} className={`star ${i <= store.rating ? '' : 'empty'}`}>★</span>
                        ))}
                        <span>({store.rating})</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="data-section">
          <div className="section-header">
            <h3>Users</h3>
            <button onClick={() => setShowAddUser(true)} className="btn">+ Add User</button>
          </div>
          <div className="filters">
            <div className="filter-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="Filter by name"
                value={filters.userName}
                onChange={(e) => setFilters({ ...filters, userName: e.target.value })}
              />
            </div>
            <div className="filter-group">
              <label>Email</label>
              <input
                type="text"
                placeholder="Filter by email"
              />
            </div>
            <div className="filter-group">
              <label>Address</label>
              <input
                type="text"
                placeholder="Filter by address"
                value={filters.userAddress}
                onChange={(e) => setFilters({ ...filters, userAddress: e.target.value })}
              />
            </div>
            <div className="filter-group">
              <label>Role</label>
              <select
                value={filters.userRole}
                onChange={(e) => setFilters({ ...filters, userRole: e.target.value })}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>Name {filters.sortBy === 'name' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('email')}>Email {filters.sortBy === 'email' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('address')}>Address {filters.sortBy === 'address' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('role')}>Role {filters.sortBy === 'role' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}</th>
                  <th>Store Rating</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.address || 'N/A'}</td>
                    <td>
                      <span className={`badge badge-${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {user.role === 'owner' ? (
                        parseFloat(user.store_rating) > 0 ? (
                          <span>★ {user.store_rating}/5</span>
                        ) : (
                          <span>No ratings</span>
                        )
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onSuccess={() => {
            setShowAddUser(false);
            fetchData();
          }}
        />
      )}

      {showAddStore && (
        <AddStoreModal
          onClose={() => setShowAddStore(false)}
          onSuccess={() => {
            setShowAddStore(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
