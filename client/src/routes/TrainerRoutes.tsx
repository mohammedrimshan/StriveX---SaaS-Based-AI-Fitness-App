import { TrainerAuth } from "@/pages/trainer/trainerAuth";
import { TrainerLayout } from "@/layouts/TrainerLayout";
import { TrainerAuthRoute } from "@/utils/protected/ProtectedRoute";
import { NoTrainerAuthRoute } from "@/utils/protected/PublicRoute";
import { Route, Routes } from "react-router-dom";


export const TrainerRoutes = () => {
	return (
		<Routes>
			{/* Admin login route outside of protected layout */}
			<Route
				index
				element={<NoTrainerAuthRoute element={<TrainerAuth />} />}
			/>
			{/* All protected admin routes inside the layout */}
			<Route
				path="/"
				element={
					<TrainerAuthRoute
						allowedRoles={["trainer"]}
						element={<TrainerLayout />}
					/>
				}>
				{/* <Route path="profileform" element={<TrainerPostRegistrationForm />} /> */}
				<Route path="clients" element={"hello"} />
				{/* Add more admin routes here as needed */}
			</Route>
		</Routes>
	);
};