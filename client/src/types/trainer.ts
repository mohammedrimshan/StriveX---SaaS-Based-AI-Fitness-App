import { ITrainer } from "./User";
export interface TrainerProfile extends ITrainer{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    profileImage: string;
    bio: string;
    location: string;
    experience: number;
    rating: number;
    clientCount: number;
    sessionCount: number;
    specialization: string[];
    certifications: string[];
    qualifications: string[];
    skills: string[];
    availability: string[];
      height?: number;
      weight?: number;
      gender?: string;
    services?: TrainerService[];
    approvedByAdmin: boolean;
  }
  
  export interface TrainerService {
    id: string;
    title: string;
    description: string;
    price: string;
    duration: string;
    icon: string;
  }
  