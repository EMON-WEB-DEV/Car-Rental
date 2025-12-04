import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config(//{path: path.join(process.cwd() , '.env')}
);


export const pool = new Pool({
connectionString: `postgresql://neondb_owner:npg_PIACEG4t7Rpz@ep-patient-mouse-a42oib0g-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`,
});

const connectDB = async () => {
  
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        age INT NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
  /*  await pool.query(`CREATE TABLE IF NOT EXISTS vehicles (
    id  PRIMARY KEY,
    vehicle_name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    daily_rental_price NUMERIC NOT NULL,
    availability_status BOOLEAN DEFAULT TRUE
)`);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS bookings (
    id  PRIMARY KEY,
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    rent_start_date DATE NOT NULL,
    rent_end_date DATE NOT NULL,
    total_price NUMERIC NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed'))
)`)*/

    };      


export default connectDB;
