import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface trainer {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: string;
}

interface trainerState {
	trainer: trainer | null;
}

const initialState: trainerState = {
	trainer: null,
};

const trainerSlice = createSlice({
	name: "trainer",
	initialState,
	reducers: {
		trainerLogin: (state, action: PayloadAction<trainer>) => {
			state.trainer = action.payload;
		},
		trainerLogout: (state) => {
			state.trainer = null;
		},
	},
});

export const { trainerLogin, trainerLogout } = trainerSlice.actions;
export default trainerSlice.reducer;
