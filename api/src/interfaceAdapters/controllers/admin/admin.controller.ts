import { inject, injectable } from "tsyringe";
import { IAdminController } from "@/entities/controllerInterfaces/admin-controller.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/shared/constants";
import { Request, Response } from "express";
import { ZodError } from "zod";

@injectable()
export class AdminController implements IAdminController {
	constructor() {}
}
