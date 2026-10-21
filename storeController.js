const pool = require('../config/db');

const getStores = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, address, sortBy = 'name', order = 'asc' } = req.query;
    
    const sortCol = ['name', 'address'].includes(sortBy) ? sortBy : 'name';
    const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
    
    let query = `
      SELECT s.id, s.name, s.address, 
             COALESCE(AVG(r.rating), 0) as avg_rating,
             ur.rating as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = $1
      WHERE 1=1
    `;
    
    const params = [userId];
    let paramCount = 2;
    
    if (name) {
      query += ` AND s.name ILIKE $${paramCount}`;
      params.push(`%${name}%`);
      paramCount++;
    }
    
    if (address) {
      query += ` AND s.address ILIKE $${paramCount}`;
      params.push(`%${address}%`);
      paramCount++;
    }
    
    query += ` GROUP BY s.id, ur.rating ORDER BY s.${sortCol} ${sortOrder}`;
    
    const result = await pool.query(query, params);
    res.json({ stores: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
};

const submitRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storeId } = req.params;
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
        const storeCheck = await pool.query('SELECT id FROM stores WHERE id = $1', [storeId]);
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
        const result = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating) 
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, store_id) 
       DO UPDATE SET rating = $3, created_at = NOW()
       RETURNING *`,
      [userId, storeId, rating]
    );
    
    res.json({ rating: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
};

module.exports = { getStores, submitRating };
