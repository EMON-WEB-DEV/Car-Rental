// src/services/auth.service.ts
import pool from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt';
import dotenv from 'dotenv';
dotenv.config();

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

export const AuthService = {
  async createUser({ name, email, password, phone, role }: any) {
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const q = `INSERT INTO users (name,email,password,phone,role) VALUES ($1,$2,$3,$4,$5) RETURNING id,name,email,phone,role`;
    const r = await pool.query(q, [name, email.toLowerCase(), hashed, phone, role]);
    return r.rows[0];
  },

  async authenticate({ email, password }: any) {
    const q = `SELECT id,name,email,password,role FROM users WHERE email = $1`;
    const r = await pool.query(q, [email.toLowerCase()]);
    if (r.rowCount === 0) return null;
    const user = r.rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;

    const secret: jwt.Secret = JWT_SECRET as unknown as jwt.Secret;
    const expiresIn: jwt.SignOptions['expiresIn'] = (JWT_EXPIRES_IN as unknown as jwt.SignOptions['expiresIn']) ?? '1h';

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, name: user.name },
      secret,
      { expiresIn }
    );
    return token;
  }
};
