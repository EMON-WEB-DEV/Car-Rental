// src/controllers/vehicles.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { VehiclesService } from '../services/vehicles.service';

export async function createVehicle(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const vehicle = await VehiclesService.create(req.body);
  res.status(201).json(vehicle);
}

export async function getAllVehicles(req: Request, res: Response) {
  const vehicles = await VehiclesService.getAll();
  res.json(vehicles);
}

export async function getVehicle(req: Request, res: Response) {
  const v = await VehiclesService.getById(req.params.vehicleId as string);
  if (!v) return res.status(404).json({ message: 'Vehicle not found' });
  res.json(v);
}

export async function updateVehicle(req: Request, res: Response) {
  const vehicle = await VehiclesService.update(req.params.vehicleId as string, req.body);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  res.json(vehicle);
}

export async function deleteVehicle(req: Request, res: Response) {
  try {
    await VehiclesService.delete(req.params.vehicleId as string);
    res.status(204).send();
  } catch (err: any) {
    if (err.code === 'HAS_ACTIVE_BOOKINGS') return res.status(400).json({ message: 'Cannot delete vehicle with active bookings' });
    throw err;
  }
}
