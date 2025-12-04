// src/controllers/bookings.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { BookingsService } from '../services/booking.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export async function createBooking(req: AuthRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const payload = {
    customer_id: req.body.customer_id || req.user!.id,
    vehicle_id: req.body.vehicle_id,
    rent_start_date: req.body.rent_start_date,
    rent_end_date: req.body.rent_end_date,
  };

  try {
    const booking = await BookingsService.createBooking(payload);
    res.status(201).json(booking);
  } catch (err: any) {
    if (err.code === 'VEHICLE_NOT_AVAILABLE') return res.status(400).json({ message: 'Vehicle not available for the requested period' });
    if (err.code === 'INVALID_DATES') return res.status(400).json({ message: 'rent_end_date must be after rent_start_date' });
    throw err;
  }
}

export async function getBookings(req: AuthRequest, res: Response) {
  // admin: all bookings, customer: own bookings
  const user = req.user!;
  if (user.role === 'admin') {
    const all = await BookingsService.getAll();
    return res.json(all);
  } else {
    const own = await BookingsService.getByCustomer(user.id);
    return res.json(own);
  }
}

export async function updateBooking(req: AuthRequest, res: Response) {
  const user = req.user!;
  const bookingId = req.params.bookingId;
  // If customer => cancel before start date only
  if (user.role === 'customer') {
    try {
      const canceled = await BookingsService.cancelBookingByCustomer(bookingId as string, user.id);
      return res.json(canceled);
    } catch (err: any) {
      if (err.code === 'CANNOT_CANCEL') return res.status(400).json({ message: err.message });
      if (err.code === 'NOT_OWN') return res.status(403).json({ message: 'Forbidden' });
      throw err;
    }
  } else if (user.role === 'admin') {
    // Admin marks as returned
    try {
      const updated = await BookingsService.markReturned(bookingId as string);
      return res.json(updated);
    } catch (err: any) {
      if (err.code === 'NOT_FOUND') return res.status(404).json({ message: 'Booking not found' });
      throw err;
    }
  } else {
    return res.status(403).json({ message: 'Forbidden' });
  }
}
