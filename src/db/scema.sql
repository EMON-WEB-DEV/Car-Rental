-- db/schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','customer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('car','bike','van','SUV')),
  registration_number TEXT NOT NULL UNIQUE,
  daily_rent_price NUMERIC(10,2) NOT NULL CHECK (daily_rent_price > 0),
  availability_status TEXT NOT NULL CHECK (availability_status IN ('available','booked')) DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  rent_start_date DATE NOT NULL,
  rent_end_date DATE NOT NULL,
  total_price NUMERIC(12,2) NOT NULL CHECK (total_price >= 0),
  status TEXT NOT NULL CHECK (status IN ('active','cancelled','returned')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Useful indexes
CREATE INDEX idx_bookings_vehicle_status ON bookings(vehicle_id, status);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
