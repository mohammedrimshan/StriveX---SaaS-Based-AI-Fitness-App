import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { PrivateHeader } from "@/components/headers/Header/PrivateHeader";
import { Header as PublicHeader } from "@/components/headers/Header/PublicHeader";
import { AppSidebar } from "@/components/sidebars/SideBar";
import { useLogout } from "@/hooks/auth/useLogout";
import { logoutClient } from "@/services/auth/authService";
import { useDispatch, useSelector } from "react-redux";
import { clientLogout } from "@/store/slices/client.slice";
import { useToaster } from "@/hooks/ui/useToaster";
import { RootState } from "@/store/store";
import Chatbot from "@/components/common/ChatBot";

export const ClientLayout = () => {
	const [isSideBarVisible, setIsSideBarVisible] = useState(false);
	const { successToast, errorToast } = useToaster();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const user = useSelector((state: RootState) => state.client.client);
	const isLoggedIn = !!user; 
	const { mutate: logoutReq } = useLogout(logoutClient);

	const handleLogout = () => {
		logoutReq(undefined, {
			onSuccess: (data) => {
				dispatch(clientLogout());
				successToast(data.message);
				navigate("/")
			},
			onError: (err: any) => {
				errorToast(err.response.data.message);
			},
		});
	};

	return (
		<div className="flex flex-col min-h-screen">
			{/* Conditional Header Rendering */}
			{isLoggedIn ? (
				<PrivateHeader
					className="z-40"
					userType="user"
					userName={user?.firstName}
					userAvatar={user?.profileImage}
					onLogout={handleLogout}
					onSidebarToggle={() => setIsSideBarVisible(!isSideBarVisible)}
				/>
			) : (
				<PublicHeader />
			)}

			{/* Show sidebar only for logged in users */}
			{isLoggedIn && (
				<AppSidebar
					isVisible={isSideBarVisible}
					onClose={() => setIsSideBarVisible(false)}
					handleLogout={handleLogout}
					role="client"
				/>
			)}
			
			{/* Main content */}
			<Outlet context={user}/>
			{isLoggedIn && <Chatbot />}
		</div>
	);
};