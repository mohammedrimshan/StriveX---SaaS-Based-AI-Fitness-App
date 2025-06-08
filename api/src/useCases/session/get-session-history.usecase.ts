import { injectable, inject } from "tsyringe";
import { ISessionHistoryModel } from "@/frameworks/database/mongoDB/models/session-history.model";
import { ISessionHistoryRepository } from "@/entities/repositoryInterfaces/session/session-history-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { IAdminRepository } from "@/entities/repositoryInterfaces/admin/admin-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS, ROLES, SlotStatus } from "@/shared/constants";
import { Types } from "mongoose";
import { IGetSessionHistoryUseCase } from "@/entities/useCaseInterfaces/session/get-session-history-usecase.interface";

@injectable()
export class GetSessionHistoryUseCase implements IGetSessionHistoryUseCase {
  constructor(
    @inject("ISessionHistoryRepository") private sessionHistoryRepository: ISessionHistoryRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("IAdminRepository") private adminRepository: IAdminRepository
  ) {}

  async execute(
    userId: string,
    role: "trainer" | "client" | "admin",
    skip: number,
    limit: number
  ): Promise<{ items: ISessionHistoryModel[]; total: number }> {
    console.log("UseCase: Received role:", role, "Expected roles:", ROLES); // Add logging
    if (role === ROLES.TRAINER) {
      const trainer = await this.trainerRepository.findById(userId);
      if (!trainer) {
        throw new CustomError("Trainer not found", HTTP_STATUS.NOT_FOUND);
      }
      return this.sessionHistoryRepository.find(
        { trainerId: new Types.ObjectId(userId), status: SlotStatus.BOOKED },
        skip,
        limit
      );
    } else if (role === ROLES.USER) {
      const client = await this.clientRepository.findByClientNewId(userId);
      if (!client) {
        throw new CustomError("Client not found", HTTP_STATUS.NOT_FOUND);
      }
      return this.sessionHistoryRepository.find(
        { clientId: new Types.ObjectId(userId), status: SlotStatus.BOOKED },
        skip,
        limit
      );
    } else if (role === ROLES.ADMIN) {
      const admin = await this.adminRepository.findById(userId);
      console.log(admin, "UseCase: Admin found:", admin); 
      if (!admin) {
        throw new CustomError("Admin not found", HTTP_STATUS.NOT_FOUND);
      }
      return this.sessionHistoryRepository.find({}, skip, limit);
    } else {
      throw new CustomError("Invalid role", HTTP_STATUS.BAD_REQUEST);
    }
  }
}