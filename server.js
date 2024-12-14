require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const app = express();

app.use(express.json());
app.use('/auth', authRoutes);
app.use((req, res, next) => {
  if (req.method === 'GET' && req.url === '/') {
    res.send('API Autentikasi FlavorScape siap digunakan!');
  } else {
    next();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});