import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useFormik } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import Lottie from "lottie-react";
// Import shadcn components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Import your existing validation schema
import { passwordSchema } from "@/utils/validations/password.validator";

// Import assets
import congrats from "@/assets/congrats.json"; 
// Import your hooks (maintain the same functionality)
import { useResetPasswordMutation } from "@/hooks/auth/useResetPassword";
import { useToaster } from "@/hooks/ui/useToaster";
import { ResetPasswordProps } from "@/types/Response";

const ResetPassword = ({ role, signInPath }: ResetPasswordProps) => {
  const { token } = useParams();
  const [passwordReset, setPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const navigate = useNavigate();
  const { successToast, errorToast } = useToaster();
  const { mutate: resetPasswordReq, isPending } = useResetPasswordMutation();
  
  const handleResetPasswordSubmit = (password: string) => {
    resetPasswordReq(
      { password, role, token },
      {
        onSuccess: (data) => {
          successToast(data.message);
          setPasswordReset(true);
          setShowSuccessModal(true);
        },
        onError: (error: any) => {
          errorToast(error.response?.data?.message || "Password reset failed");
        },
      }
    );
  };

  // Using your existing formik setup with the imported passwordSchema
  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: passwordSchema,
    onSubmit: (values) => {
      handleResetPasswordSubmit(values.password);
    },
  });

  return (
    <>
      <div className="min-h-screen flex flex-col md:flex-row bg-white">
        {/* Left Section with Image - Full width, full height */}
        <div className="hidden md:block w-1/2 bg-violet-100 relative overflow-hidden order-1">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-violet-700/30"></div>
          <img
            src="https://res.cloudinary.com/daee3szbl/image/upload/v1750764278/reset_x3xayr.jpg"
            alt="Security illustration"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </div>

        {/* Right section with form */}
        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center bg-white order-2">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-md mx-auto w-full space-y-8"
          >
            {/* Go Back Link */}
            <Button 
              variant="ghost" 
              onClick={() => navigate(signInPath)}
              className="flex items-center text-muted-foreground hover:text-violet-600 transition-colors p-0"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Sign In
            </Button>

            {passwordReset ? (
              // Success State (shown outside of modal)
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <div>
                  <h2 className="text-3xl font-bold tracking-tight mb-2">
                    Password Reset Complete
                  </h2>
                  <p className="text-muted-foreground">
                    Your password has been successfully reset. You can now log in with your new password.
                  </p>
                </div>
                <Button
                  onClick={() => navigate(signInPath)}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                >
                  Go to Sign in
                </Button>
              </motion.div>
            ) : (
              // Form State
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold tracking-tight text-violet-900">
                    Reset Your Password
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    Please enter your new password below
                  </p>
                </div>

                <form 
                  className="space-y-6"
                  onSubmit={formik.handleSubmit}
                >
                  <div className="space-y-4">
                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-violet-900">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formik.values.password}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="Enter your new password"
                          className="border-violet-200 focus:border-violet-400 focus:ring-violet-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-violet-600"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {formik.touched.password && formik.errors.password && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.password}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-violet-900">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formik.values.confirmPassword}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="Confirm your new password"
                          className="border-violet-200 focus:border-violet-400 focus:ring-violet-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-violet-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    disabled={isPending}
                    type="submit"
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {isPending ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Success Modal with Lottie Animation */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-violet-900">Congratulations!</DialogTitle>
            <DialogDescription className="text-center">
              Your password has been successfully reset.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-64 h-64"
            >
              <Lottie
                loop
                animationData={congrats}
                style={{ width: '100%', height: '100%' }}
              />
            </motion.div>
          </div>
          <div className="flex justify-center">
            <Button 
              onClick={() => {
                setShowSuccessModal(false);
                navigate(signInPath);
              }}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              Go to Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResetPassword;