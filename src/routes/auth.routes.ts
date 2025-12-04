// src/routes/auth.routes.ts
import { Router } from 'express';
import { signup, signin } from '../controllers/auth.controller';
import { body } from 'express-validator';

const router = Router();

router.post('/signup',
  body('name').isString().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('phone').isMobilePhone('any'),
  body('role').optional().isIn(['admin','customer']),
  signup
);

router.post('/signin',
  body('email').isEmail(),
  body('password').exists(),
  signin
);

export default router;
