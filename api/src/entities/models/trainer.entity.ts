import { IUserEntity } from "./user.entity";
import { TrainerApprovalStatus } from "@/shared/constants";


export interface ITrainerEntity extends IUserEntity {
  qualifications: string[]; 
  experience: number; 
  specialization?: string[]; 
  certifications?: string[]; 
  approvedByAdmin: boolean; 
  approvalStatus: TrainerApprovalStatus;
}
