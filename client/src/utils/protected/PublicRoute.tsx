import { Navigate,useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useEffect } from "react";

interface NoAuthRouteProps {
	element: JSX.Element;
}

export const NoAuthRoute = ({ element }: NoAuthRouteProps) => {
	const user = useSelector((state: RootState) => state.client.client);
	if (user && user?.role !== "client") {
		return <Navigate to={"/unauthorized"} />;
	}

	if (user) {
		return <Navigate to="/home" />;
	}

	return element;
};

export const NoTrainerAuthRoute = ({ element }: NoAuthRouteProps) => {
	const user = useSelector((state: RootState) => state.trainer.trainer);

	if (user && user?.role !== "trainer") {
		return <Navigate to={"/unauthorized"} />;
	}

	if (user) {
		return <Navigate to="/trainer/trainerhome" />;
	}

	return element;
};

export const NoAdminAuthRoute = ({ element }: NoAuthRouteProps) => {
	const user = useSelector((state: RootState) => state.admin.admin);
	const location = useLocation();
	
	// This helps ensure the redirect happens consistently even with browser navigation
	useEffect(() => {
		// If we're at the admin login page and the user is logged in, we should redirect
		if (user && location.pathname === "/admin") {
			window.history.replaceState(null, "", "/admin/dashboard");
			window.location.reload(); // Force a reload to ensure the redirect happens
		}
	}, [user, location.pathname]);
	
	if (user && user?.role !== "admin") {
		return <Navigate to="/unauthorized" replace />;
	}

	if (user) {
		return <Navigate to="/admin/dashboard" replace />;
	}

	return element;
};