// src/routes/vehicles.routes.ts
import { Router } from 'express';
import { createVehicle, getAllVehicles, getVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicles.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { body, param } from 'express-validator';

const router = Router();

router.post('/', authenticateToken, requireRole('admin'),
  body('vehicle_name').isString().notEmpty(),
  body('type').isIn(['car','bike','van','SUV']),
  body('registration_number').isString().notEmpty(),
  body('daily_rent_price').isFloat({ gt: 0 }),
  body('availability_status').optional().isIn(['available','booked']),
  createVehicle
);

router.get('/', getAllVehicles);
router.get('/:vehicleId', param('vehicleId').isUUID(), getVehicle);

router.put('/:vehicleId', authenticateToken, requireRole('admin'),
  param('vehicleId').isUUID(),
  body('vehicle_name').optional().isString(),
  body('type').optional().isIn(['car','bike','van','SUV']),
  body('registration_number').optional().isString(),
  body('daily_rent_price').optional().isFloat({ gt: 0 }),
  body('availability_status').optional().isIn(['available','booked']),
  updateVehicle
);

router.delete('/:vehicleId', authenticateToken, requireRole('admin'), param('vehicleId').isUUID(), deleteVehicle);

export default router;
