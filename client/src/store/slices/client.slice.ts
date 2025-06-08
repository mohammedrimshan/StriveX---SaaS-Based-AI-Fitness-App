import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Client {
	id: string;
	clientId?:string;
	firstName: string;
	lastName: string;
	email: string;
	role?: string;
	phoneNumber:string;
	profileImage?: string;
	fitnessGoal?: "weightLoss" | "muscleGain" | "endurance" | "flexibility" | "maintenance";
	experienceLevel?: "beginner" | "intermediate" | "advanced" | "expert";
	activityLevel?: "sedentary" | "light" | "moderate" | "active" | "veryActive";
	healthConditions?: string[];
	waterIntake?: number;
	waterIntakeTarget?: number;
	dietPreference?: string;
	preferredWorkout?:string;
	workoutExperience?:string;
	selectStatus?: string;
	isPremium?: boolean;
	membershipPlanId?: string;
	isActive?: boolean;
	height?: number;
	weight?: number;
}

interface ClientState {
	client: Client | null;
}

const initialState: ClientState = {
	client: null,
};

const clientSlice = createSlice({
	name: "client",
	initialState,
	reducers: {
		clientLogin: (state, action: PayloadAction<Client>) => {
			state.client = action.payload;
		},
		clientLogout: (state) => {
			state.client = null;
		},
	},
});

export const { clientLogin, clientLogout } = clientSlice.actions;
export default clientSlice.reducer;