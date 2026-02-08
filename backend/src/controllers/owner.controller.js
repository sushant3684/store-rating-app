const db = require('../config/db');

exports.getDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const [stores] = await db.query(`
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        COALESCE(ROUND(AVG(r.rating), 2), 0) as average_rating,
        COUNT(DISTINCT r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = ?
      GROUP BY s.id
    `, [ownerId]);

    if (stores.length === 0) {
      return res.json({
        success: true,
        data: {
          stores: [],
          message: 'No stores found for this owner'
        }
      });
    }

    res.json({
      success: true,
      data: {
        stores
      }
    });
  } catch (error) {
    console.error('Get owner dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
};

exports.getStoreRatings = async (req, res) => {
  try {
    const { storeId } = req.params;
    const ownerId = req.user.id;

    const [stores] = await db.query(
      'SELECT id FROM stores WHERE id = ? AND owner_id = ?',
      [storeId, ownerId]
    );

    if (stores.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Store not found or does not belong to you.'
      });
    }

    const [ratings] = await db.query(`
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `, [storeId]);

    const [avgRating] = await db.query(`
      SELECT COALESCE(ROUND(AVG(rating), 2), 0) as average_rating
      FROM ratings
      WHERE store_id = ?
    `, [storeId]);

    res.json({
      success: true,
      data: {
        average_rating: avgRating[0].average_rating,
        total_ratings: ratings.length,
        ratings
      }
    });
  } catch (error) {
    console.error('Get store ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching store ratings'
    });
  }
};
