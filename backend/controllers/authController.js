const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const createToken = (userId) => {
  const payload = {
    user: {
      id: userId,
    },
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
};

const register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ msg: 'First name, last name, email and password are required' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const [result] = await pool.execute(
      'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
      [fullName, normalizedEmail, hashedPassword, 'student']
    );

    res.status(201).json({ token: createToken(result.insertId) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ msg: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Email and password are required' });
  }

  try {
    const [users] = await pool.execute(
      'SELECT id, password FROM users WHERE email = ? LIMIT 1',
      [email.toLowerCase().trim()]
    );
    const user = users[0];

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    res.json({ token: createToken(user.id) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error during login' });
  }
};

const me = async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, full_name, email, role, created_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );

    if (!users[0]) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(users[0]);
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ msg: 'Server error while loading profile' });
  }
};

const updateProfile = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ msg: 'Full name and email are required' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1',
      [normalizedEmail, req.user.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ msg: 'Email already used by another account' });
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await pool.execute(
        'UPDATE users SET full_name = ?, email = ?, password = ? WHERE id = ?',
        [fullName.trim(), normalizedEmail, hashedPassword, req.user.id]
      );
    } else {
      await pool.execute(
        'UPDATE users SET full_name = ?, email = ? WHERE id = ?',
        [fullName.trim(), normalizedEmail, req.user.id]
      );
    }

    const [users] = await pool.execute(
      'SELECT id, full_name, email, role, created_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );

    res.json(users[0]);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ msg: 'Server error while updating profile' });
  }
};

module.exports = {
  me,
  register,
  updateProfile,
  login,
};
