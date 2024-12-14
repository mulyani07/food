const jwt = require('jsonwebtoken');
const firestore = require('../config/firestore');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Tidak ada token, otorisasi ditolak' });
  }

  try {
    const isBlacklisted = await User.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token tidak valid' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userRef = firestore.collection('users').doc(decoded.userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(401).json({ error: 'Pengguna tidak valid' });
    }

    req.user = { 
      id: decoded.userId, 
      token: token,
      ...userDoc.data() 
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token tidak valid' });
  }
};

module.exports = authMiddleware;