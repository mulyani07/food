const firestore = require('../config/firestore');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
  constructor(data = {}) {
    this.name = data.name || '';
    this.email = data.email || '';
    this.password = data.password || '';
    this.createdAt = data.createdAt || new Date();
  }

  validate() {
    const errors = [];
    if (!this.name) errors.push('Nama harus diisi');
    if (!this.email) errors.push('Email harus diisi');
    if (!this.email.includes('@')) errors.push('Email tidak valid');
    if (this.password.length < 8) errors.push('Password minimal 8 karakter');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async hashPassword() {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  async save() {
    const validation = this.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const existingUser = await firestore
      .collection('users')
      .where('email', '==', this.email)
      .get();

    if (!existingUser.empty) {
      throw new Error('Email sudah terdaftar');
    }

    await this.hashPassword();

    const userRef = firestore.collection('users').doc();
    await userRef.set({
      name: this.name,
      email: this.email,
      password: this.password,
      createdAt: this.createdAt
    });

    return userRef.id;
  }

  static async login(email, password) {
    const userSnapshot = await firestore
      .collection('users')
      .where('email', '==', email)
      .get();

    if (userSnapshot.empty) {
      throw new Error('Email atau password salah');
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      throw new Error('Email atau password salah');
    }

    const token = jwt.sign(
      { userId: userDoc.id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: userDoc.id,
        name: userData.name,
        email: userData.email
      }
    };
  }

  static async getProfile(userId) {
    const userDoc = await firestore.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new Error('Pengguna tidak ditemukan');
    }

    return {
      id: userDoc.id,
      ...userDoc.data(),
      password: undefined
    };
  }

  static async logout(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const blacklistRef = firestore.collection('token_blacklist').doc();
      await blacklistRef.set({
        token: token,
        expiresAt: new Date(decoded.exp * 1000)
      });

      return true;
    } catch (error) {
      throw new Error('Logout gagal');
    }
  }

  static async isTokenBlacklisted(token) {
    const blacklistSnapshot = await firestore
      .collection('token_blacklist')
      .where('token', '==', token)
      .get();

    return !blacklistSnapshot.empty;
  }
}

module.exports = User;