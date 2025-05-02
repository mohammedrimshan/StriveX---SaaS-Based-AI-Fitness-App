import { Request, Response } from "express";

export interface ISlotController {
  createSlot(req: Request, res: Response): Promise<void>;
  getTrainerSlots(req: Request, res: Response): Promise<void>;
  bookSlot(req: Request, res: Response): Promise<void>;
  cancelBooking(req: Request, res: Response): Promise<void>;
  getUserBookings(req: Request, res: Response): Promise<void>;
  toggleSlotAvailability(req: Request, res: Response): Promise<void>;
}