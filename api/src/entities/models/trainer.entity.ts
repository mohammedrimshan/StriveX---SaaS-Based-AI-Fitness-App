import { IUserEntity } from "./user.entity";
import { TrainerApprovalStatus } from "@/shared/constants";
import { Gender } from "@/shared/constants";

export interface ITrainerEntity extends IUserEntity {
  fcmToken?: string;
  dateOfBirth?: string;
  gender?: Gender;
  qualifications?: string[]; 
  experience?: number; 
  skills?: string[];
  specialization?: string[]; 
  certifications?: string[]; 
  approvedByAdmin?: boolean; 
  approvalStatus: TrainerApprovalStatus;
  rejectionReason?: string;
  googleId?: string;
  stripeConnectId:string;
  clientCount?: number;
  rating?: number;
  reviewCount?: number;
}
