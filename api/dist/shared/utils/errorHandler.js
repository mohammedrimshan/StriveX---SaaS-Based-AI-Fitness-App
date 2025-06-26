"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleErrorResponse = handleErrorResponse;
const zod_1 = require("zod");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
function handleErrorResponse(res, error) {
    console.error(error);
    if (error instanceof zod_1.ZodError) {
        const errors = error.errors.map((err) => ({
            message: err.message,
        }));
        res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: constants_1.ERROR_MESSAGES.VALIDATION_ERROR,
            errors,
        });
        return;
    }
    if (error instanceof custom_error_1.CustomError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
        return;
    }
    console.log("Unhandled error:", error);
    res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: constants_1.ERROR_MESSAGES.SERVER_ERROR,
    });
}
