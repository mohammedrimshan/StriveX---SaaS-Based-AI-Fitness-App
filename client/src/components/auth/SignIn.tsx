import { useState } from "react";
import { TextField, Button } from "@mui/material";
import { Eye, EyeOff } from "lucide-react";
import { useFormik } from "formik";
import { signinSchema } from "@/utils/validations/signin.validator";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GoogleAuthButton } from "./googleAuth";
import { SignInProps } from "@/types/Response";

const SignIn = ({
  userType,
  onSubmit,
  setRegister,
  isLoading,
  handleGoogleAuth,
}: SignInProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: signinSchema,
    onSubmit: (values) => {
      console.log(values);
      onSubmit(values);
    },
  });

  const bgImages = {
    admin:
      "https://res.cloudinary.com/daee3szbl/image/upload/v1750762549/admin-bg_ezjkhj.jpg",
    trainer:
      "https://res.cloudinary.com/daee3szbl/image/upload/v1750762528/trainer-bg_fkfh5n.jpg",
    default:
      "https://res.cloudinary.com/daee3szbl/image/upload/v1750762538/sgn2_hs4kf1.jpg",
  };

  const getBgImage = () => {
    switch (userType) {
      case "admin":
        return bgImages.admin;
      case "trainer":
        return bgImages.trainer;
      default:
        return bgImages.default;
    }
  };

  const handleForgotPasswordRedirection = () => {
    switch (userType) {
      case "trainer":
        navigate("/trainer/forgot-password");
        break;
      case "admin":
        navigate("/admin/forgot-password");
        break;
      default:
        navigate("/forgot-password");
        break;
    }
  };

  return (
    <>
      {/* <Header /> */}
      <div className="min-h-screen flex flex-col md:flex-row pt-[4rem] md:pt-0">
        {/* Left Section with Image */}
        <div className="hidden md:flex w-1/2 bg-[var(--bg-violet)] relative overflow-hidden justify-center items-end">
          <div className="absolute inset-0 pattern-bg opacity-10"></div>
          <img
            src={getBgImage() || "/placeholder.svg"}
            alt="fitness-equipment-bg"
            className="absolute inset-0 w-full h-full object-cover brightness-90"
          />
        </div>

        {/* Right Section with Form */}
        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center bg-white">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-md mx-auto w-full space-y-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight">
                Sign in to your account
              </h2>
              <p className="text-muted-foreground mt-2">
                Enter your credentials to continue
              </p>
            </div>

            <form className="space-y-4" onSubmit={formik.handleSubmit}>
              <div className="flex flex-col gap-4">
                {/* Email */}
                <TextField
                  id="email"
                  name="email"
                  type="email"
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email ? formik.errors.email : ""}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  fullWidth
                  label="Email"
                  placeholder="Enter your email"
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "var(--violet)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "var(--violet)",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "var(--violet)",
                    },
                    "& .MuiFormHelperText-root": {
                      fontSize: "0.75rem",
                      lineHeight: "1rem",
                      minHeight: "1rem",
                    },
                  }}
                />

                {/* Password */}
                <TextField
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  helperText={
                    formik.touched.password ? formik.errors.password : ""
                  }
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  fullWidth
                  label="Password"
                  placeholder="Enter password"
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "var(--violet)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "var(--violet)",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "var(--violet)",
                    },
                    "& .MuiFormHelperText-root": {
                      fontSize: "0.75rem",
                      lineHeight: "1rem",
                      minHeight: "1rem",
                    },
                  }}
                />
              </div>

              {/* Forgot Password & Register Now */}
              <div className="flex items-center justify-between space-x-2">
                <div className="text-sm">
                  <span
                    onClick={handleForgotPasswordRedirection}
                    className="text-[var(--violet)] hover:text-[var(--violet-hover)] hover:cursor-pointer"
                  >
                    Forgot password?
                  </span>
                </div>
                {userType !== "admin" && (
                  <div className="flex items-center gap-1.5">
                    <label
                      htmlFor="register"
                      className="text-sm text-muted-foreground"
                    >
                      Don't have an account?{" "}
                    </label>
                    <span
                      onClick={setRegister}
                      className="text-[var(--violet)] hover:text-[var(--violet-hover)] cursor-pointer"
                    >
                      Register Now!
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                disabled={isLoading}
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: "var(--violet)",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "var(--violet-hover)",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "var(--violet)",
                    opacity: 0.7,
                    color: "white",
                  },
                }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sign In
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>

              {/* Social SignIn */}
              {userType !== "admin" && (
                <>
                  <div className="text-center my-4 text-muted-foreground text-xs">
                    OR
                  </div>
                  <GoogleAuthButton handleGoogleSuccess={handleGoogleAuth} />
                </>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
