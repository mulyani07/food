const User = require('../models/user');

class AuthController {
  static async register(req, res) {
    try {
      const { name, email, password } = req.body;
      
      const user = new User({ name, email, password });
      
      const userId = await user.save();

      res.status(201).json({ 
        message: 'Registrasi berhasil', 
        userId 
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      const result = await User.login(email, password);

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      
      const profile = await User.getProfile(userId);

      res.json(profile);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async logout(req, res) {
    try {
      const token = req.user.token;

      await User.logout(token);

      res.json({ 
        message: 'Logout berhasil',
        info: 'Token telah di-blacklist'
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = AuthController;