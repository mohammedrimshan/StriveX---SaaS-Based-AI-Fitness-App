import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { PrivateHeader } from "@/components/headers/Header/PrivateHeader";
import { AppSidebar } from "@/components/sidebars/SideBar";
import { useLogout } from "@/hooks/auth/useLogout";
import { useDispatch, useSelector } from "react-redux";
import { useToaster } from "@/hooks/ui/useToaster";
import { RootState } from "@/store/store";
import { logoutAdmin } from "@/services/auth/authService";
import { adminLogout } from "@/store/slices/admin.slice";


export const AdminLayout = () => {
	const [isSideBarVisible, setIsSideBarVisible] = useState(false);
	const { successToast, errorToast } = useToaster();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const user = useSelector((state: RootState) => state.admin.admin);
	const { mutate: logoutReq } = useLogout(logoutAdmin);

	const handleLogout = () => {
		logoutReq(undefined, {
			onSuccess: (data) => {
				navigate("/admin");
				dispatch(adminLogout());
				successToast(data.message);
			},
			onError: (err: any) => {
				errorToast(err.response.data.message);
			},
		});
	};

	return (
		<div className="flex flex-col min-h-screen bg-gray-100">
			{/* Header */}
			<PrivateHeader
				className="z-40"
				userType="admin"
				userName={user?.firstName}
				onLogout={handleLogout}
				onSidebarToggle={() => setIsSideBarVisible(!isSideBarVisible)}
			/>

			{/* Main content area with sidebar and outlet */}
			<AppSidebar
				role="admin"
				isVisible={isSideBarVisible}
				onClose={() => setIsSideBarVisible(false)}
				handleLogout={handleLogout}
			/>
			{/* Main content */}
			<Outlet />
		</div>
	);
};
