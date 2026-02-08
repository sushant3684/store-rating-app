const db = require('../config/db');

exports.getStores = async (req, res) => {
  try {
    const { name, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const userId = req.user.id;

    let query = `
      SELECT 
        s.id, 
        s.name, 
        s.address,
        COALESCE(ROUND(AVG(r.rating), 2), 0) as overall_rating,
        COUNT(DISTINCT r.id) as total_ratings,
        ur.rating as user_rating,
        ur.id as user_rating_id
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = ?
      WHERE 1=1
    `;
    const params = [userId];

    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }
    if (address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${address}%`);
    }

    query += ' GROUP BY s.id, ur.rating, ur.id';

    const validSortFields = ['name', 'address', 'overall_rating'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    if (sortField === 'overall_rating') {
      query += ` ORDER BY overall_rating ${order}`;
    } else {
      query += ` ORDER BY s.${sortField} ${order}`;
    }

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

exports.submitRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    const [stores] = await db.query('SELECT id FROM stores WHERE id = ?', [storeId]);
    
    if (stores.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Store not found' 
      });
    }

    const [existingRatings] = await db.query(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (existingRatings.length > 0) {
      await db.query(
        'UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [rating, existingRatings[0].id]
      );

      res.json({
        success: true,
        message: 'Rating updated successfully',
        data: {
          id: existingRatings[0].id,
          user_id: userId,
          store_id: storeId,
          rating
        }
      });
    } else {
      const [result] = await db.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [userId, storeId, rating]
      );

      res.status(201).json({
        success: true,
        message: 'Rating submitted successfully',
        data: {
          id: result.insertId,
          user_id: userId,
          store_id: storeId,
          rating
        }
      });
    }
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting rating' 
    });
  }
};

exports.getStoreDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [stores] = await db.query(`
      SELECT 
        s.id, 
        s.name, 
        s.email,
        s.address,
        COALESCE(ROUND(AVG(r.rating), 2), 0) as overall_rating,
        COUNT(DISTINCT r.id) as total_ratings,
        ur.rating as user_rating,
        ur.id as user_rating_id
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = ?
      WHERE s.id = ?
      GROUP BY s.id, ur.rating, ur.id
    `, [userId, id]);

    if (stores.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Store not found' 
      });
    }

    res.json({
      success: true,
      data: stores[0]
    });
  } catch (error) {
    console.error('Get store details error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching store details' 
    });
  }
};
