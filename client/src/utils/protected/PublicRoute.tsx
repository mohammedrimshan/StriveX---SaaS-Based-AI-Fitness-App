import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

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
		return <Navigate to="/trainer/dashboard" />;
	}

	return element;
};

export const NoAdminAuthRoute = ({ element }: NoAuthRouteProps) => {
	const user = useSelector((state: RootState) => state.admin.admin);

	if (user && user?.role !== "admin") {
		return <Navigate to={"/unauthorized"} />;
	}

	if (user) {
		return <Navigate to="/admin/dashboard" />;
	}

	return element;
};
