import { useRegisterMutation } from "@/hooks/auth/userRegister";
import { ILoginData, User } from "@/types/User";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SignUp from "@/components/auth/SignUp";
import SignIn from "@/components/auth/SignIn";
import { useToaster } from "@/hooks/ui/useToaster";
import { useLoginMutation } from "@/hooks/auth/useLogin";
import { useDispatch } from "react-redux";
import { trainerLogin } from "@/store/slices/trainer.slice";
import { useNavigate } from "react-router-dom";

export const TrainerAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoginLoading, setIsLoginLoading] = useState(false);
    const [isRegisterLoading, setIsRegisterLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { mutate: loginClient } = useLoginMutation();
    const { mutate: registerClient } = useRegisterMutation();

    const { errorToast, successToast } = useToaster();

    const handleSignUpSubmit = (data: Omit<User, "role">) => {
        setIsRegisterLoading(true);
        registerClient(
            { ...data, role: "trainer" },
            {
                onSuccess: (data) => {
                    successToast(data.message);
                    setIsLogin(true);
                    setIsRegisterLoading(false);
                },
                onError: (error: any) => {
                    errorToast(error.response.data.message);
                    setIsRegisterLoading(false);
                },
            }
        );
    };
    
    const handleLoginSubmit = (data: Omit<ILoginData, "role">) => {
        setIsLoginLoading(true);
        loginClient(
            { ...data, role: "trainer" },
            {
                onSuccess: (data) => {
                    successToast(data.message);
                    dispatch(trainerLogin(data.user));
                    navigate("/trainerhome");
                    setIsLoginLoading(false);
                },
                onError: (error: any) => {
                    errorToast(error.response.data.message);
                    setIsLoginLoading(false);
                },
            }
        );
    };

    // Different animation variants for login and signup transitions
    const loginVariants = {
        initial: { opacity: 0, x: -100 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 100 }
    };
    
    const signupVariants = {
        initial: { opacity: 0, x: 100 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -100 }
    };

    return (
        <>
            <AnimatePresence mode="wait">
                {isLogin ? (
                    <motion.div
                        key="login"
                        variants={loginVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.5 }}>
                        <SignIn
                            userType="trainer"
                            onSubmit={handleLoginSubmit}
                            setRegister={() => setIsLogin(false)}
                            isLoading={isLoginLoading}
                            handleGoogleAuth={() => {}}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="signup"
                        variants={signupVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.5 }}>
                        <SignUp
                            userType="trainer"
                            onSubmit={handleSignUpSubmit}
                            setLogin={() => setIsLogin(true)}
                            isLoading={isRegisterLoading}
                            handleGoogleAuth={() => {}}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};