import { injectable } from "tsyringe";
import { IAdminEntity } from "@/entities/models/admin.entity";
import { IAdminRepository } from "@/entities/repositoryInterfaces/admin/admin-repository.interface";
import { AdminModel } from "@/frameworks/database/mongoDB/models/admin.model";

@injectable()
export class AdminRepository implements IAdminRepository {
  async save(data: Partial<IAdminEntity>): Promise<IAdminEntity> {
    const admin = new AdminModel(data);
    const savedAdmin = await admin.save();
    
    return {
      ...savedAdmin.toObject(),
      id: savedAdmin._id.toString(),
    } as IAdminEntity;
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