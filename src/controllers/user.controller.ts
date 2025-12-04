// src/controllers/users.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { UsersService } from '../services/user.service';

export async function getAllUsers(req: Request, res: Response) {
  const users = await UsersService.getAll();
  res.json(users);
}

export async function updateUser(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const updated = await UsersService.update(req.params.userId as string, req.body);
  if (!updated) return res.status(404).json({ message: 'User not found' });
  res.json(updated);
}

export async function deleteUser(req: Request, res: Response) {
  try {
    await UsersService.delete(req.params.userId as string);
    res.status(204).send();
  } catch (err: any) {
    if (err.code === 'HAS_ACTIVE_BOOKINGS') return res.status(400).json({ message: 'Cannot delete user with active bookings' });
    throw err;
  }
}
