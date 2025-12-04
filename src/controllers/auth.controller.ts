// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';

export async function signup(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, phone, role } = req.body;
  try {
    const user = await AuthService.createUser({ name, email, password, phone, role: role || 'customer' });
    // don't return password
    res.status(201).json({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role });
  } catch (err: any) {
    if (/(unique|duplicate)/i.test(err.message)) return res.status(409).json({ message: 'Email already exists' });
    throw err;
  }
}

export async function signin(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const token = await AuthService.authenticate({ email, password });
  if (!token) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ token });
}
