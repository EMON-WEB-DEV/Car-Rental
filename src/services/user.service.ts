// src/services/users.service.ts
import pool from '../config/db';
import bcrypt from 'bcrypt';
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

export const UsersService = {
  async getAll() {
    const r = await pool.query(`SELECT id,name,email,phone,role,created_at FROM users ORDER BY created_at DESC`);
    return r.rows;
  },

  async update(id: string, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const k of ['name','email','phone','role','password']) {
      if (k in data) {
        const v = k === 'password' ? await bcrypt.hash(data.password, SALT_ROUNDS) : data[k];
        fields.push(`${k}=$${idx}`);
        values.push(k === 'email' ? (v as string).toLowerCase() : v);
        idx++;
      }
    }
    if (!fields.length) {
      const r = await pool.query(`SELECT id,name,email,phone,role,created_at FROM users WHERE id=$1`, [id]);
      return r.rows[0];
    }
    values.push(id);
    const q = `UPDATE users SET ${fields.join(',')} WHERE id=$${idx} RETURNING id,name,email,phone,role,created_at`;
    const r = await pool.query(q, values);
    return r.rows[0];
  },

  async delete(id: string) {
    const r = await pool.query(`SELECT 1 FROM bookings WHERE customer_id=$1 AND status='active' LIMIT 1`, [id]);
    if (r.rowCount !== null && r.rowCount > 0) {
      const err: any = new Error('User has active bookings');
      err.code = 'HAS_ACTIVE_BOOKINGS';
      throw err;
    }
    await pool.query(`DELETE FROM users WHERE id=$1`, [id]);
  }
};
