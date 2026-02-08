const bcrypt = require('bcryptjs');
const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
    const [storeCount] = await db.query('SELECT COUNT(*) as count FROM stores');
    const [ratingCount] = await db.query('SELECT COUNT(*) as count FROM ratings');

    res.json({
      success: true,
      data: {
        totalUsers: userCount[0].count,
        totalStores: storeCount[0].count,
        totalRatings: ratingCount[0].count
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
};

exports.addUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address || null, role]
    );

    const [users] = await db.query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: users[0]
    });
  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user'
    });
  }
};

exports.addStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const [existingStores] = await db.query(
      'SELECT id FROM stores WHERE email = ?',
      [email]
    );

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }

    if (existingStores.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Store with this email already exists'
      });
    }

    if (ownerId) {
      const [owners] = await db.query(
        'SELECT id FROM users WHERE id = ? AND role = ?',
        [ownerId, 'owner']
      );

      if (owners.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid owner ID or user is not a store owner'
        });
      }
    }

    const [result] = await db.query(
      'INSERT INTO stores (name, email, address, owner_id, owner_name) VALUES (?, ?, ?, ?, ?)',
      [name, email, address || null, ownerId || null, req.body.ownerName || null]
    );

    const [stores] = await db.query(`
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address,
        s.owner_id,
        COALESCE(AVG(r.rating), 0) as rating,
        s.created_at
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.id = ?
      GROUP BY s.id
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      data: stores[0]
    });
  } catch (error) {
    console.error('Add store error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating store'
    });
  }
};

exports.getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    let query = `
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address,
        s.owner_id,
        s.owner_name,
        COALESCE(ROUND(AVG(r.rating), 2), 0) as rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = [];

    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }
    if (email) {
      query += ' AND s.email LIKE ?';
      params.push(`%${email}%`);
    }
    if (address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${address}%`);
    }

    query += ' GROUP BY s.id';

    const validSortFields = ['name', 'email', 'address', 'rating'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    query += ` ORDER BY ${sortField === 'rating' ? 'rating' : 's.' + sortField} ${order}`;

    const [stores] = await db.query(query, params);

    res.json({
      success: true,
      data: stores
    });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stores'
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    let query = `
      SELECT 
        id, name, email, address, role, created_at,
        CASE 
          WHEN role = 'owner' THEN (
            SELECT COALESCE(ROUND(AVG(r.rating), 2), 0)
            FROM stores s
            LEFT JOIN ratings r ON s.id = r.store_id
            WHERE s.owner_id = users.id
          )
          ELSE NULL
        END as store_rating
      FROM users WHERE 1=1
    `;
    const params = [];

    if (name) {
      query += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }
    if (email) {
      query += ' AND email LIKE ?';
      params.push(`%${email}%`);
    }
    if (address) {
      query += ' AND address LIKE ?';
      params.push(`%${address}%`);
    }
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    const validSortFields = ['name', 'email', 'address', 'role'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    query += ` ORDER BY ${sortField} ${order}`;

    const [users] = await db.query(query, params);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    if (user.role === 'owner') {
      const [stores] = await db.query(`
        SELECT 
          s.id,
          s.name,
          COALESCE(ROUND(AVG(r.rating), 2), 0) as rating
        FROM stores s
        LEFT JOIN ratings r ON s.id = r.store_id
        WHERE s.owner_id = ?
        GROUP BY s.id
      `, [id]);

      user.stores = stores;
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details'
    });
  }
};
