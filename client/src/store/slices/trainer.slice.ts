import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { ITrainer } from "@/types/User";


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
