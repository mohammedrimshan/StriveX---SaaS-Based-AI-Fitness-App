import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { PrivateHeader } from "@/components/headers/Header/PrivateHeader";
import { Header as PublicHeader } from "@/components/headers/Header/PublicHeader";
import { AppSidebar } from "@/components/sidebars/SideBar";
import { useLogout } from "@/hooks/auth/useLogout";
import { logoutTrainer } from "@/services/auth/authService";
import { useDispatch, useSelector } from "react-redux";
import { trainerLogout } from "@/store/slices/trainer.slice";
import { useToaster } from "@/hooks/ui/useToaster";
import { RootState } from "@/store/store";

export const TrainerLayout = () => {
    const [isSideBarVisible, setIsSideBarVisible] = useState(false);
    const { successToast, errorToast } = useToaster();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.trainer.trainer);
    console.log(user)
    const isLoggedIn = !!user; // Check if user exists
    const { mutate: logoutReq } = useLogout(logoutTrainer);

    const handleLogout = () => {
        logoutReq(undefined, {
            onSuccess: (data) => {
                dispatch(trainerLogout());
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
                    userName={user?.firstName}
                    onLogout={handleLogout}
                    userAvatar={user?.profileImage}
                    userType="trainer"
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
                    role="trainer"
                />
            )}
            
            {/* Main content */}
            <Outlet context={user}/>
        </div>
    );
};