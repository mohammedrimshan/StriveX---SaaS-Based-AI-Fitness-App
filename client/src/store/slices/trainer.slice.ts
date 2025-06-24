import { UserRole } from "@/types/UserRole";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface ITrainer {
   id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  specialization?: string[]
  phoneNumber: string;
  role?: UserRole;
  dateOfBirth?: string;
  height?: number;
  weight?: number;
  gender?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  clientCount?: number;
  isActive?: boolean;
  
}

const initialState: { trainer: ITrainer | null } = {
  trainer: null,
};
const trainerSlice = createSlice({
  name: "trainer",
  initialState,
  reducers: {
    trainerLogin: (state, action: PayloadAction<ITrainer>) => {
      state.trainer = action.payload
    },
    trainerLogout: (state) => {
      state.trainer = null
    },
  },
})

export const { trainerLogin, trainerLogout } = trainerSlice.actions
export default trainerSlice.reducer
