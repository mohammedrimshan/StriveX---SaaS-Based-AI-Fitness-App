import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { ITrainer } from "@/types/User";
// interface Trainer {
//   id: string
//   firstName: string
//   lastName: string
//   email: string
//   role: string
//   phoneNumber?: string
//   profileImage?: string
//   height?: number
//   weight?: number
//   dateOfBirth?: string
//   gender?: string
//   experience?: number
//   skills?: string[]
//   qualifications?: string[]
//   specialization?: string[]
//   certifications?: string[]
// }

interface TrainerState {
  trainer: ITrainer | null
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

