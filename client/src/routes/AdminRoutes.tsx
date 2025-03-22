import { AdminAuth } from "@/pages/admin/AdminAuth";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AdminAuthRoute } from "@/utils/protected/ProtectedRoute";
import { NoAdminAuthRoute } from "@/utils/protected/PublicRoute";
import { Route, Routes } from "react-router-dom";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagement from "@/pages/admin/AdminUserManagement";
import TrainerVerificationPage from "@/pages/admin/TrainerVerification";

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
				{/* Add more admin routes here as needed */}
			</Route>
		</Routes>
	);
};