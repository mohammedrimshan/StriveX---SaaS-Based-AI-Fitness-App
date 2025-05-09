import { AdminAuth } from "@/pages/admin/AdminAuth";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AdminAuthRoute } from "@/utils/protected/ProtectedRoute";
import { NoAdminAuthRoute } from "@/utils/protected/PublicRoute";
import { Route, Routes } from "react-router-dom";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagement from "@/pages/admin/AdminUserManagement";
import TrainerVerificationPage from "@/pages/admin/TrainerVerification";
import ResetPassword from "@/components/auth/ResetPassword";
import ForgotPassword from "@/components/auth/ForgotPassword";
import Categories from "@/pages/admin/Categories";
import AdminWorkoutsPage from "@/pages/admin/Workout";
import WorkoutsListPage from "@/pages/admin/WorkoutList/WorkoutsListPage";
import WorkoutDetailPage from "@/pages/admin/WorkoutList/WorkoutDetailPage";
import MembershipPlans from "@/pages/admin/AddMembership/MembershipPlans";
import WorkoutFormPage from "@/pages/admin/WorkoutList/WorkoutFormPage";

export const AdminRoutes = () => {
	return (
		<Routes>
			{/* Admin login route outside of protected layout */}
			<Route
				index
				element={<NoAdminAuthRoute element={<AdminAuth />} />}
			/>
			
			{/* All protected admin routes inside the layout */}
			<Route
				path="/"
				element={
					<AdminAuthRoute
						allowedRoles={["admin"]}
						element={<AdminLayout />}
					/>
				}>
				<Route path="dashboard" element={<AdminDashboard />} />
				<Route path="clients" element={<UserManagement userType="client"/>} />
				<Route path="trainers" element={<UserManagement userType="trainer"/>} />
				<Route path="trainerverification" element={<TrainerVerificationPage />} />
				<Route path="category" element={<Categories />} />
				<Route path="workout" element={<AdminWorkoutsPage />} />
				<Route path="membership" element={<MembershipPlans />} />
				{/* Add more admin routes here as needed */}


				<Route path="/workouts" element={<WorkoutsListPage />} />
          <Route path="/workouts/:id" element={<WorkoutDetailPage />} />
          {/* Exercises */}
          {/* <Route path="/workouts/:workoutId/exercises/new" element={<ExerciseFormPage />} /> */}
          {/* <Route path="/workouts/:workoutId/exercises/edit/:exerciseId" element={<ExerciseFormPage />} /> */}
          <Route path="/workouts/new" element={<WorkoutFormPage />} />
<Route path="/workouts/edit/:id" element={<WorkoutFormPage />} />
			</Route>
			{/*//? Forgot and reset pages */}
			<Route
				path="/forgot-password"
				element={
					<NoAdminAuthRoute
						element={
							<ForgotPassword role="admin" signInPath="/admin" />
						}
					/>
				}
			/>
			<Route
				path="/reset-password/:token"
				element={
					<NoAdminAuthRoute
						element={
							<ResetPassword role="admin" signInPath="/admin" />
						}
					/>
				}
			/>
		</Routes>
	);
};