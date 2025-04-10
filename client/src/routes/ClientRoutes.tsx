import { Route, Routes } from "react-router-dom";
import { ClientAuth } from "@/pages/client/clientAuth";
import { ClientLayout } from "@/layouts/ClientLayout";
import { AuthRoute } from "@/utils/protected/ProtectedRoute";
import { NoAuthRoute } from "@/utils/protected/PublicRoute";
import LandingPage from "@/components/landing/Landing";
import ForgotPassword from "@/components/auth/ForgotPassword";
import ResetPassword from "@/components/auth/ResetPassword";
import ProfileForm from "@/pages/client/ProfileForm";
import { PlanGenerator } from "@/pages/client/GenerateAi";
import TrainersPage from "@/pages/client/TrainerList";
import Index from "@/pages/client/TrainerProfilePage";
import UserWorkout from "@/pages/client/UserWorkouts";
import WorkoutDetails from "@/pages/client/Workouts/WorkoutDetails";
export const ClientRoutes = () => {
	return (
		<Routes>
			<Route element={<ClientLayout />}>
				{/* Public routes inside the layout */}
				<Route index element={<LandingPage />} />
				<Route 
					path="/login" 
					element={<NoAuthRoute element={<ClientAuth />} />} 
				/>
				
				{/* Protected routes */}
				<Route path="/home" element={
					<AuthRoute allowedRoles={["client"]} element={<LandingPage />} />
				} />
				<Route path="/profile" element={
					<AuthRoute allowedRoles={["client"]} element={<ProfileForm />} />
				} />
				<Route path="/aiplanning" element={
					<AuthRoute allowedRoles={["client"]} element={<PlanGenerator />} />
				} />
				
				<Route path="/alltrainers" element={
					<AuthRoute allowedRoles={["client"]} element={<TrainersPage />} />
				} />
				<Route path="/trainerprofile/:trainerId" element={
					<AuthRoute allowedRoles={["client"]} element={<Index />} />
				} />
				
				<Route path="/workouts" element={
					<AuthRoute allowedRoles={["client"]} element={<UserWorkout />} />
				} />
				
				<Route path="/workout/:id" element={
					<AuthRoute allowedRoles={["client"]} element={<WorkoutDetails />} />
				} />
				

				
				{/* Add more protected routes as needed */}
			</Route>
			<Route
				path="/forgot-password"
				element={
					<NoAuthRoute
						element={
							<ForgotPassword role="client" signInPath="/" />
						}
					/>
				}
			/>
			<Route
				path="/reset-password/:token"
				element={
					<NoAuthRoute
						element={<ResetPassword role="client" signInPath="/" />}
					/>
				}
			/>
		</Routes>
	);
};