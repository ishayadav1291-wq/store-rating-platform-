const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { validatePassword, validateName, validateAddress, validateEmail } = require('../utils/validation');

const signup = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;
    
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
    
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
        const hash = await bcrypt.hash(password, 10);
    
        const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [name, email, hash, address, 'user']
    );
    
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
        const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    if (!validatePassword(newPassword)) {
      return res.status(400).json({ error: 'Password must be 8-16 chars with uppercase and special character' });
    }
    
        const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];
    
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password incorrect' });
    }
    
        const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, userId]);
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Password change failed' });
  }
};

module.exports = { signup, login, changePassword };
