import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config(//{path: path.join(process.cwd() , '.env')}
);


export const pool = new Pool({
connectionString: `postgresql://neondb_owner:npg_PIACEG4t7Rpz@ep-patient-mouse-a42oib0g-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`,
});

const connectDB = async () => {
  
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
        id AUTO GENERATED PRIMARY KEY,
        name VARCHAR(100) REQUIRED NOT NULL,
        email VARCHAR(100)  REQUIRED UNIQUE  LOWERCASE NOT NULL,
        password VARCHAR(100) REQUIRED MIN 6 CHAR NOT NULL,
        phone VARCHAR(15) REQUIRED NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'customer')) DEFAULT 'customer',
        )`);
    
    };      


export default connectDB;
