// src/app.ts
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import authRoutes from './routes/auth.routes';
import vehiclesRoutes from './routes/vehicles.routes';
import usersRoutes from './routes/user.routes';
import bookingsRoutes from './routes/booking.routes';
//import { errorHandler } from './middleware/errorHandler';

const app = express();
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vehicles', vehiclesRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/bookings', bookingsRoutes);

//app.use(errorHandler);

export default app;
