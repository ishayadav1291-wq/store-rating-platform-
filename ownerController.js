const pool = require('../config/db');

const getDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;
    
        const storeResult = await pool.query(
      `SELECT s.id, s.name, s.address, 
              COALESCE(AVG(r.rating), 0) as avg_rating,
              COUNT(r.id) as rating_count
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.owner_id = $1
       GROUP BY s.id`,
      [ownerId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'No store found for this owner' });
    }
    
    const store = storeResult.rows[0];
    
        const ratersResult = await pool.query(
      `SELECT u.name, r.rating, r.created_at
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC`,
      [store.id]
    );
    
    res.json({
      store: {
        id: store.id,
        name: store.name,
        address: store.address,
        avgRating: parseFloat(store.avg_rating).toFixed(2),
        ratingCount: parseInt(store.rating_count)
      },
      raters: ratersResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
};

module.exports = { getDashboard };
