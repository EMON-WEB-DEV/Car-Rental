// src/services/bookings.service.ts
import pool from '../config/db';
import { PoolClient } from 'pg';

function daysBetween(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export const BookingsService = {
  async createBooking({ customer_id, vehicle_id, rent_start_date, rent_end_date }: any) {
    // validate dates
    const start = new Date(rent_start_date);
    const end = new Date(rent_end_date);
    if (end <= start) {
      const err: any = new Error('Invalid dates');
      err.code = 'INVALID_DATES';
      throw err;
    }

    const client: PoolClient = await pool.connect();
    try {
      await client.query('BEGIN');

      // check vehicle exists and status available
      const vq = `SELECT * FROM vehicles WHERE id=$1 FOR UPDATE`;
      const vr = await client.query(vq, [vehicle_id]);
      if (vr.rowCount === 0) {
        const err: any = new Error('Vehicle not found');
        err.code = 'VEHICLE_NOT_FOUND';
        throw err;
      }
      const vehicle = vr.rows[0];

      if (vehicle.availability_status !== 'available') {
        const err: any = new Error('Vehicle not available');
        err.code = 'VEHICLE_NOT_AVAILABLE';
        throw err;
      }

      // Optionally check overlapping bookings to be stricter
      const overlapQ = `SELECT 1 FROM bookings WHERE vehicle_id=$1 AND status='active' AND NOT (rent_end_date < $2 OR rent_start_date > $3) LIMIT 1`;
      const overlapR = await client.query(overlapQ, [vehicle_id, rent_start_date, rent_end_date]);
      if ((overlapR?.rowCount ?? 0) > 0) {
        const err: any = new Error('Vehicle not available for requested dates');
        err.code = 'VEHICLE_NOT_AVAILABLE';
        throw err;
      }

      // compute price: days * daily_rent_price
      const numDays = daysBetween(rent_start_date, rent_end_date);
      const total = Number(vehicle.daily_rent_price) * numDays;

      const insertQ = `INSERT INTO bookings (customer_id,vehicle_id,rent_start_date,rent_end_date,total_price,status) VALUES ($1,$2,$3,$4,$5,'active') RETURNING *`;
      const insertR = await client.query(insertQ, [customer_id, vehicle_id, rent_start_date, rent_end_date, total]);

      // update vehicle to booked
      await client.query(`UPDATE vehicles SET availability_status='booked' WHERE id=$1`, [vehicle_id]);

      await client.query('COMMIT');
      return insertR.rows[0];
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  },

  async getAll() {
    const r = await pool.query(`SELECT b.*, u.name as customer_name, v.vehicle_name FROM bookings b
      JOIN users u ON b.customer_id=u.id
      JOIN vehicles v ON b.vehicle_id=v.id
      ORDER BY b.created_at DESC`);
    return r.rows;
  },

  async getByCustomer(customerId: string) {
    const r = await pool.query(`SELECT b.*, v.vehicle_name FROM bookings b JOIN vehicles v ON b.vehicle_id=v.id WHERE b.customer_id=$1 ORDER BY b.created_at DESC`, [customerId]);
    return r.rows;
  },

  async cancelBookingByCustomer(bookingId: string, customerId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const q = `SELECT * FROM bookings WHERE id=$1 FOR UPDATE`;
      const r = await client.query(q, [bookingId]);
      if (r.rowCount === 0) {
        const err: any = new Error('Not found');
        err.code = 'NOT_FOUND';
        throw err;
      }
      const booking = r.rows[0];
      if (booking.customer_id !== customerId) {
        const err: any = new Error('Not owner');
        err.code = 'NOT_OWN';
        throw err;
      }
      const now = new Date();
      const start = new Date(booking.rent_start_date);
      if (now >= start) {
        const err: any = new Error('Cannot cancel after start date');
        err.code = 'CANNOT_CANCEL';
        throw err;
      }
      // mark cancelled
      await client.query(`UPDATE bookings SET status='cancelled' WHERE id=$1`, [bookingId]);
      // update vehicle status if there are no other active bookings for it
      const activeQ = `SELECT 1 FROM bookings WHERE vehicle_id=$1 AND status='active' LIMIT 1`;
      const act = await client.query(activeQ, [booking.vehicle_id]);
      if (act.rowCount === 0) {
        await client.query(`UPDATE vehicles SET availability_status='available' WHERE id=$1`, [booking.vehicle_id]);
      }
      await client.query('COMMIT');
      const out = (await pool.query(`SELECT * FROM bookings WHERE id=$1`, [bookingId])).rows[0];
      return out;
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  },

  async markReturned(bookingId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const q = `SELECT * FROM bookings WHERE id=$1 FOR UPDATE`;
      const r = await client.query(q, [bookingId]);
      if (r.rowCount === 0) {
        const err: any = new Error('Booking not found');
        err.code = 'NOT_FOUND';
        throw err;
      }
      const booking = r.rows[0];
      if (booking.status === 'returned') return booking;
      await client.query(`UPDATE bookings SET status='returned' WHERE id=$1`, [bookingId]);
      // set vehicle available (but check if other active bookings exist)
      const activeQ = `SELECT 1 FROM bookings WHERE vehicle_id=$1 AND status='active' LIMIT 1`;
      const act = await client.query(activeQ, [booking.vehicle_id]);
      if (act.rowCount === 0) {
        await client.query(`UPDATE vehicles SET availability_status='available' WHERE id=$1`, [booking.vehicle_id]);
      }
      await client.query('COMMIT');
      const out = (await pool.query(`SELECT * FROM bookings WHERE id=$1`, [bookingId])).rows[0];
      return out;
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  },

  // System helper: find bookings that should be auto-returned (rent_end_date < today and status='active')
  async findBookingsToAutoReturn() {
    const r = await pool.query(`SELECT id FROM bookings WHERE status='active' AND rent_end_date < CURRENT_DATE`);
    return r.rows.map((r2) => r2.id);
  },

  async markReturnedById(bookingId: string) {
    // convenience wrapper around markReturned
    return this.markReturned(bookingId);
  }
};
