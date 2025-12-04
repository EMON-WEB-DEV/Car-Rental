// src/routes/users.routes.ts
import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole, adminOrOwn } from '../middlewares/role.middleware';
import { getAllUsers, updateUser, deleteUser } from '../controllers/user.controller';
import { param, body } from 'express-validator';

const router = Router();

router.get('/', authenticateToken, requireRole('admin'), getAllUsers);

router.put('/:userId', authenticateToken, adminOrOwn('userId'),
  param('userId').isUUID(),
  body('name').optional().isString(),
  body('email').optional().isEmail(),
  body('phone').optional().isMobilePhone('any'),
  body('role').optional().isIn(['admin','customer']),
  updateUser
);

router.delete('/:userId', authenticateToken, requireRole('admin'), param('userId').isUUID(), deleteUser);

export default router;
