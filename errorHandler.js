const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Duplicate entry' });
  }
  
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Invalid reference' });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }
  
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error' 
  });
};

module.exports = errorHandler;
