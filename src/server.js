import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8102;
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_mini_lms_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const DATA_FILE = path.resolve(__dirname, '..', process.env.DATA_FILE || 'data/users.json');

// Middleware
app.use(cors());
app.use(express.json());

// Tracing & Request ID Middleware
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
});

// Helper response formatting sesuai panduan
const sendSuccess = (res, data = {}, status = 200, req) => {
  return res.status(status).json({
    success: true,
    data,
    meta: {
      request_id: req.requestId
    }
  });
};

const sendError = (res, code, message, status = 400, req) => {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message
    },
    meta: {
      request_id: req.requestId
    }
  });
};

// Database Helpers (JSON File)
const readUsers = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading data file:', err);
    return [];
  }
};

const saveUsers = (users) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf-8');
};

// Helper Token Verification
const verifyTokenFromHeader = (req) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  const token = parts[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// ==========================================
// ROUTES
// ==========================================

// 1. Health Check
app.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'healthy',
    service: 'authentication-service',
    timestamp: new Date().toISOString()
  });
});

// 2. Register
app.post('/api/auth/register', (req, res) => {
  const { username, name, password, role } = req.body || {};

  if (!username || !password) {
    return sendError(res, 'missing_required_fields', 'Username dan password wajib diisi', 400, req);
  }

  const users = readUsers();
  const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existingUser) {
    return sendError(res, 'username_already_exists', 'Username sudah terdaftar', 409, req);
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: `usr-${crypto.randomBytes(4).toString('hex')}`,
    username,
    name: name || username,
    password: hashedPassword,
    role: role || 'mahasiswa',
    created_at: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  const { password: _, ...userSafe } = newUser;
  return sendSuccess(res, { user: userSafe }, 201, req);
});

// 3. Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return sendError(res, 'missing_required_fields', 'Username dan password wajib diisi', 400, req);
  }

  const users = readUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return sendError(res, 'invalid_credentials', 'Username atau password salah', 401, req);
  }

  const payload = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return sendSuccess(res, {
    user: payload,
    token
  }, 200, req);
});

// 4. Validate Token
app.post('/api/auth/validate', (req, res) => {
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.body && req.body.token) {
    token = req.body.token;
  }

  if (!token) {
    return sendError(res, 'missing_token', 'Token tidak ditemukan pada header Authorization atau body', 401, req);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return sendSuccess(res, {
      valid: true,
      user: {
        id: decoded.id,
        username: decoded.username,
        name: decoded.name,
        role: decoded.role
      }
    }, 200, req);
  } catch (err) {
    return sendError(res, 'invalid_token', 'Token tidak valid atau telah kedaluwarsa', 401, req);
  }
});

// 5. Get Current User (Me)
app.get('/api/auth/me', (req, res) => {
  const user = verifyTokenFromHeader(req);
  if (!user) {
    return sendError(res, 'unauthorized', 'Token tidak ada atau tidak valid', 401, req);
  }

  return sendSuccess(res, {
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    }
  }, 200, req);
});

// Start Server
app.listen(PORT, HOST, () => {
  console.log(`[Authentication Service] running on http://${HOST}:${PORT}`);
  console.log(`- Health Check: http://${HOST}:${PORT}/health`);
  console.log(`- Register: POST http://${HOST}:${PORT}/api/auth/register`);
  console.log(`- Login: POST http://${HOST}:${PORT}/api/auth/login`);
  console.log(`- Validate: POST http://${HOST}:${PORT}/api/auth/validate`);
  console.log(`- Me: GET http://${HOST}:${PORT}/api/auth/me`);
});
