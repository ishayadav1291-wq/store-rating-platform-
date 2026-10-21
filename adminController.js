const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { validatePassword, validateName, validateAddress, validateEmail } = require('../utils/validation');

const userSortColumns = ['name', 'email', 'address', 'role'];
const storeSortColumns = ['name', 'email', 'address'];

const getDashboard = async (req, res) => {
  try {
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const storeCount = await pool.query('SELECT COUNT(*) FROM stores');
    const ratingCount = await pool.query('SELECT COUNT(*) FROM ratings');
    
    res.json({
      totalUsers: parseInt(userCount.rows[0].count),
      totalStores: parseInt(storeCount.rows[0].count),
      totalRatings: parseInt(ratingCount.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
};

const getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', order = 'asc' } = req.query;

    const sortCol = userSortColumns.includes(sortBy) ? sortBy : 'name';
    const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

    let query = 'SELECT id, name, email, address, role, created_at FROM users WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (name) {
      query += ` AND name ILIKE $${paramCount}`;
      params.push(`%${name}%`);
      paramCount++;
    }
    if (email) {
      query += ` AND email ILIKE $${paramCount}`;
      params.push(`%${email}%`);
      paramCount++;
    }
    if (address) {
      query += ` AND address ILIKE $${paramCount}`;
      params.push(`%${address}%`);
      paramCount++;
    }
    if (role) {
      query += ` AND role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    query += ` ORDER BY ${sortCol} ${sortOrder}`;

    const result = await pool.query(query, params);
    res.json({ users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const userResult = await pool.query(
      'SELECT id, name, email, address, role FROM users WHERE id = $1',
      [id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
        if (user.role === 'owner') {
      const storeResult = await pool.query(
        `SELECT s.id, s.name, COALESCE(AVG(r.rating), 0) as avg_rating
         FROM stores s
         LEFT JOIN ratings r ON s.id = r.store_id
         WHERE s.owner_id = $1
         GROUP BY s.id`,
        [id]
      );
      
      user.store = storeResult.rows[0] || null;
    }
    
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
};

const addUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;
    
        if (!validateName(name)) {
      return res.status(400).json({ error: 'Name must be 20-60 characters' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be 8-16 chars with uppercase and special character' });
    }
    if (!validateAddress(address)) {
      return res.status(400).json({ error: 'Address required, max 400 characters' });
    }
    if (!['admin', 'user', 'owner'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    
    const hash = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [name, email, hash, address, role]
    );
    
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add user' });
  }
};

const getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', order = 'asc' } = req.query;
    
    const sortCol = storeSortColumns.includes(sortBy) ? sortBy : 'name';
    const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
    
    let query = `
      SELECT s.id, s.name, s.email, s.address, 
             COALESCE(AVG(r.rating), 0) as rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;
    
    if (name) {
      query += ` AND s.name ILIKE $${paramCount}`;
      params.push(`%${name}%`);
      paramCount++;
    }
    
    if (email) {
      query += ` AND s.email ILIKE $${paramCount}`;
      params.push(`%${email}%`);
      paramCount++;
    }
    
    if (address) {
      query += ` AND s.address ILIKE $${paramCount}`;
      params.push(`%${address}%`);
      paramCount++;
    }
    
    query += ` GROUP BY s.id ORDER BY s.${sortCol} ${sortOrder}`;
    
    const result = await pool.query(query, params);
    res.json({ stores: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
};

const addStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;
    
    if (!validateName(name)) {
      return res.status(400).json({ error: 'Name must be 20-60 characters' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!validateAddress(address)) {
      return res.status(400).json({ error: 'Address required, max 400 characters' });
    }
    
    const ownerCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND role = $2',
      [ownerId, 'owner']
    );
    
    if (ownerCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid owner ID or user is not an owner' });
    }
    
    const result = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, address, ownerId]
    );
    
    res.status(201).json({ store: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add store' });
  }
};

module.exports = { getDashboard, getUsers, getUserDetails, addUser, getStores, addStore };
