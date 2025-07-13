import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { IGetSessionHistoryUseCase } from "@/entities/useCaseInterfaces/session/get-session-history-usecase.interface";
import { ISessionHistoryController } from "@/entities/controllerInterfaces/session-history-controller.interface";
import { HTTP_STATUS } from "@/shared/constants";
import { CustomRequest } from "../middlewares/auth.middleware";
import { handleErrorResponse } from "@/shared/utils/errorHandler";

@injectable()
export class SessionHistoryController implements ISessionHistoryController {
  constructor(
    @inject("IGetSessionHistoryUseCase")
    private getSessionHistoryUseCase: IGetSessionHistoryUseCase
  ) {}

  async getSessionHistory(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as CustomRequest).user;
      const { skip = 0, limit = 10 } = req.query;

      const result = await this.getSessionHistoryUseCase.execute(
        user.id,
        user.role as "trainer" | "client" | "admin",
        Number(skip),
        Number(limit)
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      handleErrorResponse(req,res, error);
    }
  }
}
