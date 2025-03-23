import { Route, Routes } from "react-router-dom";
import { ClientAuth } from "@/pages/client/clientAuth";
import { ClientLayout } from "@/layouts/ClientLayout";
import { AuthRoute } from "@/utils/protected/ProtectedRoute";
import { NoAuthRoute } from "@/utils/protected/PublicRoute";
import LandingPage from "@/components/landing/Landing";
import ForgotPassword from "@/components/auth/ForgotPassword";
import ResetPassword from "@/components/auth/ResetPassword";


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