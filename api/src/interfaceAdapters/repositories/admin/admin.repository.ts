import { injectable } from "tsyringe";
import { IAdminEntity } from "@/entities/models/admin.entity";
import { IAdminRepository } from "@/entities/repositoryInterfaces/admin/admin-repository.interface";
import { AdminModel } from "@/frameworks/database/mongoDB/models/admin.model";
import { BaseRepository } from "../base.repository";
@injectable()
export class AdminRepository extends BaseRepository<IAdminEntity> implements IAdminRepository {

  constructor(){
    super(AdminModel)
  }

  async findByEmail(email: string): Promise<IAdminEntity | null> {
    const admin = await AdminModel.findOne({ email }).lean();
    if (!admin) return null;

    return {
      ...admin,
      id: admin._id.toString(),
    } as IAdminEntity;
  }
  
  async updateByEmail(
    email: string,
    updates: Partial<IAdminEntity>
  ): Promise<IAdminEntity | null> {
    const admin = await AdminModel.findOneAndUpdate(
      { email },
      { $set: updates },
      { new: true }
    ).lean();
    if (!admin) return null;

    return {
      ...admin,
      id: admin._id.toString(),
    } as IAdminEntity;
  }
}