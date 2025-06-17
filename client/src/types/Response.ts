import { UserRole } from "./UserRole";
import { IClient, User as UserType } from "@/types/User";
import { ITrainer } from "@/types/User";
import { CredentialResponse } from "@react-oauth/google";
export interface IAxiosResponse<T = any> {
   profile: IClient | PromiseLike<IClient>;
   success: boolean;
   message: string;
   data: T;
 }

 export interface AxiosWrapped<T> {
  success: boolean;
  message: string;
  profile?: IClient;
  data: T;
}


export interface IAuthResponse extends IAxiosResponse {
   user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: UserRole;
      profileImage: string;
      phoneNumber: string;
      isAdmin?:boolean
   }
}


export interface PaginatedTrainersResponse {
   trainers: ITrainer[];
   totalPages: number;
   currentPage: number;
   totalTrainers: number;
   success: boolean;
   message: string;
 }

 export interface PaginatedResponse<T> {
   data: T[];
   page: number;
   limit: number;
   total: number;
   totalPages: number;
   hasNextPage: boolean;
   hasPreviousPage: boolean;
   success: boolean;
   message: string;
 }


 export interface ForgotPasswordProps {
  role: string;
  signInPath: string;
}


export interface ResetPasswordProps {
  role: string;
  signInPath: string;
}


export interface SignInProps {
  userType: UserRole;
  onSubmit: (data: { email: string; password: string }) => void;
  setRegister?: () => void;
  isLoading: boolean;
  handleGoogleAuth: (credential: CredentialResponse) => void;
}

export interface SignUpProps {
  userType: UserRole;
  onSubmit: (data: UserType) => void;
  setLogin?: () => void;
  isLoading: boolean;
  handleGoogleAuth: (credential: CredentialResponse) => void;
}


export interface CropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: string;
  onCropComplete: (croppedImageUrl: string | null) => void;
  aspectRatio?: number;
}


export interface ProfileImageUploaderProps {
  initialImage?: string;
  onCropComplete: (croppedImageUrl: string | null) => void;
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  maxVisiblePages?: number
  className?: string
}

export interface FormProgressProps {
  currentStep: number
  totalSteps: number
  onStepClick: (step: number) => void
}

