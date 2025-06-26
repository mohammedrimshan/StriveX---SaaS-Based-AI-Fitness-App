"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotController = void 0;
const tsyringe_1 = require("tsyringe");
const zod_1 = require("zod");
const custom_error_1 = require("../../entities/utils/custom.error");
const constants_1 = require("../../shared/constants");
const errorHandler_1 = require("../../shared/utils/errorHandler");
const mongoose_1 = require("mongoose");
let SlotController = class SlotController {
    constructor(createSlotUseCase, getTrainerSlotsUseCase, bookSlotUseCase, cancelBookingUseCase, toggleSlotAvailabilityUseCase, getSelectedTrainerSlotsUseCase, getUserBookingsUseCase, getBookedTrainerSlotsUseCase, trainerSlotCancellationUseCase, reassignTrainerUseCase) {
        this.createSlotUseCase = createSlotUseCase;
        this.getTrainerSlotsUseCase = getTrainerSlotsUseCase;
        this.bookSlotUseCase = bookSlotUseCase;
        this.cancelBookingUseCase = cancelBookingUseCase;
        this.toggleSlotAvailabilityUseCase = toggleSlotAvailabilityUseCase;
        this.getSelectedTrainerSlotsUseCase = getSelectedTrainerSlotsUseCase;
        this.getUserBookingsUseCase = getUserBookingsUseCase;
        this.getBookedTrainerSlotsUseCase = getBookedTrainerSlotsUseCase;
        this.trainerSlotCancellationUseCase = trainerSlotCancellationUseCase;
        this.reassignTrainerUseCase = reassignTrainerUseCase;
    }
    createSlot(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const trainerId = req.user.id;
                const { date, startTime, endTime } = req.body;
                if (!date || !startTime || !endTime) {
                    throw new custom_error_1.CustomError("Date, start time and end time are required", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const slot = yield this.createSlotUseCase.execute(trainerId, { date, startTime, endTime });
                res.status(constants_1.HTTP_STATUS.CREATED).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.OPERATION_SUCCESS,
                    slot,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getTrainerSlots(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { startTime, endTime } = req.query;
                const user = req.user;
                if (!user.id || !user.role) {
                    throw new custom_error_1.CustomError("Authenticated user data is missing", constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                const slots = yield this.getTrainerSlotsUseCase.execute(user.id, startTime ? new Date(startTime) : undefined, endTime ? new Date(endTime) : undefined, user.role);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    slots,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    bookSlot(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clientId = req.user.id;
                const { slotId } = req.body;
                if (!slotId) {
                    throw new custom_error_1.CustomError("Slot ID is required", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const slot = yield this.bookSlotUseCase.execute(clientId, slotId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.OPERATION_SUCCESS,
                    slot,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    cancelBooking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clientId = req.user.id;
                const { slotId, cancellationReason } = req.body;
                if (!clientId || typeof clientId !== "string" || clientId.trim() === "") {
                    throw new custom_error_1.CustomError("Valid Client ID is required", constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (!slotId || !mongoose_1.Types.ObjectId.isValid(slotId)) {
                    throw new custom_error_1.CustomError("Valid Slot ID is required", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (!cancellationReason || cancellationReason.trim() === "") {
                    throw new custom_error_1.CustomError("Cancellation reason is required", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (cancellationReason.length > 500) {
                    throw new custom_error_1.CustomError("Cancellation reason must be 500 characters or less", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const slot = yield this.cancelBookingUseCase.execute(clientId, slotId, cancellationReason);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.OPERATION_SUCCESS,
                    slot,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    toggleSlotAvailability(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const trainerId = req.user.id;
                const { slotId } = req.params;
                if (!slotId) {
                    throw new custom_error_1.CustomError("Slot ID is required", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const slot = yield this.toggleSlotAvailabilityUseCase.execute(trainerId, slotId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.OPERATION_SUCCESS,
                    slot,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getSelectedTrainerSlots(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clientId = req.user.id;
                const slots = yield this.getSelectedTrainerSlotsUseCase.execute(clientId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    slots,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getUserBookings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userClientId = req.user.id;
                if (!userClientId || typeof userClientId !== "string" || userClientId.trim() === "") {
                    throw new custom_error_1.CustomError("Authentication required: Valid Client ID not found", constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                const bookings = yield this.getUserBookingsUseCase.execute(userClientId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: "Bookings retrieved successfully",
                    bookings,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getBookedTrainerSlots(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { trainerId } = req.query;
                if (!trainerId || typeof trainerId !== "string") {
                    res.status(400).json({ error: "trainerId and date are required as strings" });
                    return;
                }
                const slots = yield this.getBookedTrainerSlotsUseCase.execute(trainerId);
                res.status(200).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    slots,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    cancelTrainerSlot(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const trainerId = req.user.id;
                const { slotId, cancellationReason } = req.body;
                const inputSchema = zod_1.z.object({
                    slotId: zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
                        message: "Valid Slot ID is required",
                    }),
                    cancellationReason: zod_1.z.string().min(1, "Cancellation reason is required").max(500, "Cancellation reason must be 500 characters or less"),
                });
                inputSchema.parse({ slotId, cancellationReason });
                if (req.user.role !== "trainer") {
                    throw new custom_error_1.CustomError("Only trainers can cancel slots", constants_1.HTTP_STATUS.FORBIDDEN);
                }
                const slot = yield this.trainerSlotCancellationUseCase.execute(trainerId, slotId, cancellationReason);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.OPERATION_SUCCESS,
                    slot,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    reassignTrainer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { slotId, reason } = req.body;
                const inputSchema = zod_1.z.object({
                    slotId: zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
                        message: "Valid Slot ID is required",
                    }),
                    reason: zod_1.z.string().min(1, "Reassignment reason is required").max(500, "Reassignment reason must be 500 characters or less"),
                });
                inputSchema.parse({ slotId, reason });
                if (req.user.role !== "admin") {
                    throw new custom_error_1.CustomError("Only admins can reassign trainers", constants_1.HTTP_STATUS.FORBIDDEN);
                }
                const slot = yield this.reassignTrainerUseCase.execute(slotId, reason);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.OPERATION_SUCCESS,
                    slot,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
};
exports.SlotController = SlotController;
exports.SlotController = SlotController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ICreateSlotUseCase")),
    __param(1, (0, tsyringe_1.inject)("IGetTrainerSlotsUseCase")),
    __param(2, (0, tsyringe_1.inject)("IBookSlotUseCase")),
    __param(3, (0, tsyringe_1.inject)("ICancelBookingUseCase")),
    __param(4, (0, tsyringe_1.inject)("IToggleSlotAvailabilityUseCase")),
    __param(5, (0, tsyringe_1.inject)("IGetSelectedTrainerSlotsUseCase")),
    __param(6, (0, tsyringe_1.inject)("IGetUserBookingsUseCase")),
    __param(7, (0, tsyringe_1.inject)("IGetBookedTrainerSlotsUseCase")),
    __param(8, (0, tsyringe_1.inject)("ITrainerSlotCancellationUseCase")),
    __param(9, (0, tsyringe_1.inject)("IReassignTrainerUseCase")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], SlotController);
