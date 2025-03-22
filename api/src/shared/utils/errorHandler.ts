import { Response } from "express";
import { ZodError } from "zod";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/shared/constants";

export function handleErrorResponse(res: Response, error: unknown): void {
  if (error instanceof ZodError) {
    const errors = error.errors.map((err) => ({
      message: err.message,
    }));

    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      errors,
    });
    return;
  }

  if (error instanceof CustomError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  console.log("Unhandled error:", error);
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: ERROR_MESSAGES.SERVER_ERROR,
  });
}