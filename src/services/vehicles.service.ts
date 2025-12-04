// src/services/vehicles.service.ts
import pool from '../config/db';

export const VehiclesService = {
  async create(data: any) {
    const q = `INSERT INTO vehicles (vehicle_name,type,registration_number,daily_rent_price,availability_status)
      VALUES ($1,$2,$3,$4,$5) RETURNING *`;
    const r = await pool.query(q, [data.vehicle_name, data.type, data.registration_number, data.daily_rent_price, data.availability_status || 'available']);
    return r.rows[0];
  },

  async getAll() {
    const r = await pool.query(`SELECT * FROM vehicles ORDER BY created_at DESC`);
    return r.rows;
  },

  async getById(id: string) {
    const r = await pool.query(`SELECT * FROM vehicles WHERE id = $1`, [id]);
    return r.rows[0];
  },

  async update(id: string, data: any) {
    // naive partial update - build set dynamically
    const fields: any[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const k of ['vehicle_name','type','registration_number','daily_rent_price','availability_status']) {
      if (k in data) { fields.push(`${k}=$${idx}`); values.push((data as any)[k]); idx++; }
    }
    if (fields.length === 0) {
      const r = await pool.query(`SELECT * FROM vehicles WHERE id=$1`, [id]);
      return r.rows[0];
    }
    values.push(id);
    const q = `UPDATE vehicles SET ${fields.join(',')} WHERE id=$${idx} RETURNING *`;
    const r = await pool.query(q, values);
    return r.rows[0];
  },

  async delete(id: string) {
    // check for active bookings
    const r = await pool.query(`SELECT 1 FROM bookings WHERE vehicle_id=$1 AND status='active' LIMIT 1`, [id]);
    if ((r?.rowCount ?? 0) > 0) {
      const err: any = new Error('Vehicle has active bookings');
      err.code = 'HAS_ACTIVE_BOOKINGS';
      throw err;
    }
    await pool.query(`DELETE FROM vehicles WHERE id=$1`, [id]);
  }
};
