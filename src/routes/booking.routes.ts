// src/routes/bookings.routes.ts
import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { createBooking, getBookings, updateBooking } from '../controllers/booking.controller';
import { body, param } from 'express-validator';

const router = Router();

router.post('/', authenticateToken,
  body('customer_id').optional().isUUID(),
  body('vehicle_id').isUUID(),
  body('rent_start_date').isISO8601(),
  body('rent_end_date').isISO8601(),
  createBooking
);

router.get('/', authenticateToken, getBookings);

router.put('/:bookingId', authenticateToken, param('bookingId').isUUID(), updateBooking);

export default router;
