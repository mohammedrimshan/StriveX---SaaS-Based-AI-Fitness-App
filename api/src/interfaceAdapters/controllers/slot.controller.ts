import { inject, injectable } from "tsyringe";
import { Request, Response } from "express";
import { ISlotController } from "../../entities/controllerInterfaces/slot-controller.interface";
import { ICreateSlotUseCase } from "../../entities/useCaseInterfaces/slot/create-slot-usecase.interface";
import { IGetTrainerSlotsUseCase } from "../../entities/useCaseInterfaces/slot/get-trainer-slots-usecase.interface";
import { IBookSlotUseCase } from "../../entities/useCaseInterfaces/slot/book-slot-usecase.interface";
import { ICancelBookingUseCase } from "../../entities/useCaseInterfaces/slot/cancel-booking-usecase.interface";
import { IToggleSlotAvailabilityUseCase } from "@/entities/useCaseInterfaces/slot/chage-slot-status-usecase.interface";
import { IGetSelectedTrainerSlotsUseCase } from "@/entities/useCaseInterfaces/slot/get-selected-trainer-slots-usecase.interface";
import { IGetUserBookingsUseCase } from "@/useCases/slot/get-user-bookings.usecase";
import { CustomError } from "../../entities/utils/custom.error";
import { HTTP_STATUS, SUCCESS_MESSAGES } from "../../shared/constants";
import { handleErrorResponse } from "../../shared/utils/errorHandler";
import { CustomRequest } from "../middlewares/auth.middleware";
import { SlotResponseDTO } from "@/shared/dto/user.dto";
import { Types } from "mongoose";
import { IGetBookedTrainerSlotsUseCase } from "@/entities/useCaseInterfaces/slot/get-booked-slots.usecase.interface";

@injectable()
export class SlotController implements ISlotController {
  constructor(
    @inject("ICreateSlotUseCase") private createSlotUseCase: ICreateSlotUseCase,
    @inject("IGetTrainerSlotsUseCase")
    private getTrainerSlotsUseCase: IGetTrainerSlotsUseCase,
    @inject("IBookSlotUseCase") private bookSlotUseCase: IBookSlotUseCase,
    @inject("ICancelBookingUseCase")
    private cancelBookingUseCase: ICancelBookingUseCase,
    @inject("IToggleSlotAvailabilityUseCase")
    private toggleSlotAvailabilityUseCase: IToggleSlotAvailabilityUseCase,
    @inject("IGetSelectedTrainerSlotsUseCase")
    private getSelectedTrainerSlotsUseCase: IGetSelectedTrainerSlotsUseCase,
    @inject("IGetUserBookingsUseCase")
    private getUserBookingsUseCase: IGetUserBookingsUseCase,
    @inject("IGetBookedTrainerSlotsUseCase")
    private getBookedTrainerSlotsUseCase: IGetBookedTrainerSlotsUseCase
  ) {}

  async createSlot(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = (req as CustomRequest).user.id;
      const { date, startTime, endTime } = req.body;

      if (!date || !startTime || !endTime) {
        throw new CustomError(
          "Date, start time and end time are required",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const slot = await this.createSlotUseCase.execute(trainerId, {
        date,
        startTime,
        endTime,
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
        slot,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getTrainerSlots(req: Request, res: Response): Promise<void> {
    try {
      const { startTime, endTime } = req.query;
      const user = (req as CustomRequest).user;

      if (!user.id || !user.role) {
        throw new CustomError(
          "Authenticated user data is missing",
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      const slots = await this.getTrainerSlotsUseCase.execute(
        user.id,
        startTime ? new Date(startTime as string) : undefined,
        endTime ? new Date(endTime as string) : undefined,
        user.role as "trainer" | "client"
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        slots,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async bookSlot(req: Request, res: Response): Promise<void> {
    try {
      const clientId = (req as CustomRequest).user.id;
      const { slotId } = req.body;

      if (!slotId) {
        throw new CustomError("Slot ID is required", HTTP_STATUS.BAD_REQUEST);
      }

      const slot = await this.bookSlotUseCase.execute(clientId, slotId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
        slot,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const clientId = (req as CustomRequest).user.id;
      const { slotId, cancellationReason } = req.body as {
        slotId: string;
        cancellationReason: string;
      }; // Explicit typing

      // Validate clientId
      if (!clientId || typeof clientId !== "string" || clientId.trim() === "") {
        throw new CustomError(
          "Valid Client ID is required",
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      // Validate slotId
      if (!slotId || !Types.ObjectId.isValid(slotId)) {
        throw new CustomError(
          "Valid Slot ID is required",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      // Validate cancellationReason
      if (!cancellationReason || cancellationReason.trim() === "") {
        throw new CustomError(
          "Cancellation reason is required",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      if (cancellationReason.length > 500) {
        throw new CustomError(
          "Cancellation reason must be 500 characters or less",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const slot = await this.cancelBookingUseCase.execute(
        clientId,
        slotId,
        cancellationReason
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
        slot,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async toggleSlotAvailability(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = (req as CustomRequest).user.id;
      const { slotId } = req.params;

      if (!slotId) {
        throw new CustomError("Slot ID is required", HTTP_STATUS.BAD_REQUEST);
      }

      const slot = await this.toggleSlotAvailabilityUseCase.execute(
        trainerId,
        slotId
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
        slot,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getSelectedTrainerSlots(req: Request, res: Response): Promise<void> {
    try {
      const clientId = (req as CustomRequest).user.id;
      const slots = await this.getSelectedTrainerSlotsUseCase.execute(clientId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        slots,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getUserBookings(req: Request, res: Response): Promise<void> {
    try {
      const userClientId = (req as CustomRequest).user.id;

      if (
        !userClientId ||
        typeof userClientId !== "string" ||
        userClientId.trim() === ""
      ) {
        throw new CustomError(
          "Authentication required: Valid Client ID not found",
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      const bookings = await this.getUserBookingsUseCase.execute(userClientId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Bookings retrieved successfully",
        bookings,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getBookedTrainerSlots(req: Request, res: Response): Promise<void> {
    try {
      const { trainerId } = req.query;

      if (!trainerId || typeof trainerId !== "string") {
        res
          .status(400)
          .json({ error: "trainerId and date are required as strings" });
        return;
      }

      const slots: SlotResponseDTO[] =
        await this.getBookedTrainerSlotsUseCase.execute(trainerId);

      res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        slots,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }
}
