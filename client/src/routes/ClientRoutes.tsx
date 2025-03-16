import { Route, Routes } from "react-router-dom";
import { ClientAuth } from "@/pages/client/clientAuth";
import { ClientLayout } from "@/layouts/ClientLayout";
import { AuthRoute } from "@/utils/protected/ProtectedRoute";
import { NoAuthRoute } from "@/utils/protected/PublicRoute";
// import ForgotPassword from "@/components/auth/ForgotPassword";
// import ResetPassword from "@/components/auth/ResetPassword";
import LandingPage from "@/components/Landing"; 

export const ClientRoutes = () => {
	return (
		<Routes>
			{/* Landing page as the true index */}
			<Route index element={<LandingPage />} />
			
			{/* Auth page moved to its own route */}
			<Route path="/login" element={<NoAuthRoute element={<ClientAuth />} />} />
			
			{/* <Route
				path="/forgot-password"
				element={
					<NoAuthRoute
						element={
							<ForgotPassword role="client" signInPath="/login" />
						}
					/>
				}
			/>
			<Route
				path="/reset-password/:token"
				element={
					<NoAuthRoute
						element={<ResetPassword role="client" signInPath="/login" />}
					/>
				}
			/> */}
			<Route
				path="/"
				element={
					<AuthRoute
						allowedRoles={["client"]}
						element={<ClientLayout />}
					/>
				}>
				<Route path="home" element={<LandingPage />} />
			</Route>
		</Routes>
	);
};