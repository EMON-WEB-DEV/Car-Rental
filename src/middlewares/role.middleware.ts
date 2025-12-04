// src/middleware/roles.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export function requireRole(role: 'admin' | 'customer') {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role !== role) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

// For admin-or-own (users update)
export function adminOrOwn(reqParamId = 'userId') {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role === 'admin') return next();
    const targetId = (req.params as any)[reqParamId];
    if (req.user.id !== targetId) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}
