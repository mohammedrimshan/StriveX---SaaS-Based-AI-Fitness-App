import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  User2,
  Puzzle,
} from "lucide-react";

import { User as UserType } from "@/types/User";
import { useFormik } from "formik";
import { getValidationSchema } from "@/utils/validations/signup.validator";
import OTPModal from "@/components/modals/OTPModal";
import { useSendOTPMutation } from "@/hooks/auth/useSendOTP";
import { useVerifyOTPMutation } from "@/hooks/auth/useVerifyOTP";
import { useToaster } from "@/hooks/ui/useToaster";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { GoogleAuthButton } from "./googleAuth";
import { SignUpProps } from "@/types/Response";

// Define skills options
const skillOptions = [
  "Strength Training",
  "Mindfulness & Focus",
  "Stress Management",
  "Core Strengthening",
  "Posture Alignment",
  "Physiotherapy",
  "Muscle Buliding",
  "Flexibility",
  "Nutrition",
  "Weight Loss",
];

const SignUp = ({
  userType,
  onSubmit,
  setLogin,
  isLoading,
  handleGoogleAuth,
}: SignUpProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [userData, setUserData] = useState<UserType>({} as UserType);
  const [currentStep, setCurrentStep] = useState(1);
  const [otherSkill, setOtherSkill] = useState("");
  const { mutate: sendVerificationOTP, isPending: isSendOtpPending } =
    useSendOTPMutation();
  const { mutate: verifyOTP, isPending: isVerifyOtpPending } =
    useVerifyOTPMutation();
  const { successToast, errorToast } = useToaster();

  const submitRegister = () => {
    onSubmit(userData);
  };

  const handleOpenOTPModal = () => {
    setIsOTPModalOpen(true);
  };

  const handleCloseOTPModal = () => {
    setIsSending(false);
    setIsOTPModalOpen(false);
  };

  const handleSendOTP = (email?: string) => {
    setIsSending(() => true);
    sendVerificationOTP(email ?? userData.email, {
      onSuccess(data) {
        successToast(data.message);
        setIsSending(false);
        handleOpenOTPModal();
      },
      onError(error: any) {
        errorToast(error.response.data.message);
      },
    });
  };

  const handleVerifyOTP = (otp: string) => {
    verifyOTP(
      { email: userData.email, otp },
      {
        onSuccess(_) {
          // successToast(data.message);
          submitRegister();
          handleCloseOTPModal();
        },
        onError(error: any) {
          errorToast(error.response.data.message);
        },
      }
    );
  };

  const currentValidationSchema = getValidationSchema(userType, currentStep);
  // Handle adding other skill to skills array
  const handleAddOtherSkill = () => {
    if (
      otherSkill.trim() &&
      !formik.values.skills.includes(otherSkill.trim())
    ) {
      formik.setFieldValue("skills", [
        ...formik.values.skills,
        otherSkill.trim(),
      ]);
      setOtherSkill("");
    }
  };

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: "",
      experience: "",
      gender: "",
      skills: [] as string[],
      status: "pending",
    },
    validationSchema: currentValidationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      // For trainer registration, navigate through steps
      if (userType === "trainer") {
        if (currentStep === 1) {
          setCurrentStep(2);
          return;
        } else if (currentStep === 2) {
          setCurrentStep(3);
          return;
        }
      }
      const formattedValues = { ...values };

      if (formattedValues.dateOfBirth) {
        const date = new Date(formattedValues.dateOfBirth);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
        const year = date.getFullYear();
        formattedValues.dateOfBirth = `${day}-${month}-${year}`;
      }

      setUserData(formattedValues);
      handleSendOTP(values.email);
    },
  });

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderBasicInfoForm = () => (
    <div className="flex flex-col gap-3.5">
      {/* First & Last Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          id="firstName"
          name="firstName"
          error={formik.touched.firstName && Boolean(formik.errors.firstName)}
          helperText={formik.touched.firstName ? formik.errors.firstName : ""}
          value={formik.values.firstName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          fullWidth
          label="First Name"
          placeholder="John"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <User className="h-5 w-5 text-muted-foreground mr-2" />
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
            "& .MuiInputLabel-root.Mui-focused": { color: "var(--violet)" },
            "& .MuiFormHelperText-root": {
              fontSize: "0.75rem",
              lineHeight: "1rem",
              minHeight: "1rem",
            },
          }}
        />

        <TextField
          id="lastName"
          name="lastName"
          error={formik.touched.lastName && Boolean(formik.errors.lastName)}
          helperText={formik.touched.lastName ? formik.errors.lastName : ""}
          value={formik.values.lastName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          fullWidth
          label="Last Name"
          placeholder="Doe"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <User className="h-5 w-5 text-muted-foreground mr-2" />
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
            "& .MuiInputLabel-root.Mui-focused": { color: "var(--violet)" },
            "& .MuiFormHelperText-root": {
              fontSize: "0.75rem",
              lineHeight: "1rem",
              minHeight: "1rem",
            },
          }}
        />
      </div>

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
        InputProps={{
          startAdornment: (
            <Mail className="h-5 w-5 text-muted-foreground mr-2" />
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

      {/* Phone */}
      <TextField
        id="phoneNumber"
        name="phoneNumber"
        type="text"
        error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
        helperText={formik.touched.phoneNumber ? formik.errors.phoneNumber : ""}
        value={formik.values.phoneNumber}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        fullWidth
        label="Phone"
        placeholder="Enter your phone"
        variant="outlined"
        InputProps={{
          startAdornment: (
            <Phone className="h-5 w-5 text-muted-foreground mr-2" />
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

      {/* Password & Confirm Password */}
      <TextField
        id="password"
        name="password"
        type={showPassword ? "text" : "password"}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password ? formik.errors.password : ""}
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        fullWidth
        label="Password"
        placeholder="Create password"
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

      <TextField
        id="confirmPassword"
        name="confirmPassword"
        type={showConfirmPassword ? "text" : "password"}
        error={
          formik.touched.confirmPassword &&
          Boolean(formik.errors.confirmPassword)
        }
        helperText={
          formik.touched.confirmPassword ? formik.errors.confirmPassword : ""
        }
        value={formik.values.confirmPassword}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        fullWidth
        label="Confirm Password"
        placeholder="Confirm password"
        variant="outlined"
        InputProps={{
          endAdornment: (
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? (
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
  );

  // Second step for trainer - personal info
  const renderTrainerPersonalInfo = () => (
    <div className="flex flex-col gap-3.5">
      {/* Date of Birth */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Date of Birth"
          value={
            formik.values.dateOfBirth
              ? new Date(formik.values.dateOfBirth)
              : null
          }
          // use inputFormat instead of format
          onChange={(date) => {
            formik.setFieldValue("dateOfBirth", date);
          }}
          format="dd-MM-yyyy"
          slotProps={{
            textField: {
              id: "dateOfBirth",
              name: "dateOfBirth",
              fullWidth: true,
              variant: "outlined",
              error:
                formik.touched.dateOfBirth &&
                Boolean(formik.errors.dateOfBirth),
              helperText: formik.touched.dateOfBirth
                ? (formik.errors.dateOfBirth as string)
                : "",
              InputProps: {
                startAdornment: (
                  <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                ),
              },
              sx: {
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "var(--violet)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "var(--violet)",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "var(--violet)" },
              },
            },
          }}
        />
      </LocalizationProvider>

      {/* Experience */}
      <TextField
        id="experience"
        name="experience"
        type="number"
        error={formik.touched.experience && Boolean(formik.errors.experience)}
        helperText={formik.touched.experience ? formik.errors.experience : ""}
        value={formik.values.experience}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        fullWidth
        label="Experience (years)"
        placeholder="Enter years of experience"
        variant="outlined"
        InputProps={{
          startAdornment: (
            <Briefcase className="h-5 w-5 text-muted-foreground mr-2" />
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

      {/* Gender */}
      <FormControl
        fullWidth
        error={formik.touched.gender && Boolean(formik.errors.gender)}
      >
        <InputLabel
          id="gender-label"
          sx={{ "&.Mui-focused": { color: "var(--violet)" } }}
        >
          Gender
        </InputLabel>
        <Select
          labelId="gender-label"
          id="gender"
          name="gender"
          value={formik.values.gender}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          label="Gender"
          startAdornment={
            <User2 className="h-5 w-5 text-muted-foreground mr-2" />
          }
          sx={{
            "& .MuiOutlinedInput-notchedOutline": {
              "&:hover": {
                borderColor: "var(--violet)",
              },
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--violet)",
            },
          }}
        >
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </Select>
        {formik.touched.gender && formik.errors.gender && (
          <FormHelperText>{formik.errors.gender}</FormHelperText>
        )}
      </FormControl>
    </div>
  );

  // Third step for trainer - skills selection
  const renderTrainerSkills = () => (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center mb-2">
        <Puzzle className="h-5 w-5 text-muted-foreground mr-2" />
        <p className="text-lg font-medium">Select Your Skills</p>
      </div>

      <div className="grid grid-cols-2 gap-2 border rounded-lg p-4">
        {skillOptions.map((skill) => (
          <FormControlLabel
            key={skill}
            control={
              <Checkbox
                checked={formik.values.skills.includes(skill)}
                onChange={(e) => {
                  if (e.target.checked) {
                    formik.setFieldValue("skills", [
                      ...formik.values.skills,
                      skill,
                    ]);
                  } else {
                    formik.setFieldValue(
                      "skills",
                      formik.values.skills.filter((s) => s !== skill)
                    );
                  }
                }}
                sx={{
                  color: "var(--violet)",
                  "&.Mui-checked": {
                    color: "var(--violet)",
                  },
                }}
              />
            }
            label={skill}
          />
        ))}
      </div>

      {/* Other Skills Input */}
      <div className="mt-4">
        <p className="text-sm font-medium mb-2">Add Other Skills</p>
        <div className="flex gap-2">
          <TextField
            value={otherSkill}
            onChange={(e) => setOtherSkill(e.target.value)}
            fullWidth
            placeholder="Enter other skill"
            variant="outlined"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "var(--violet)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "var(--violet)",
                },
              },
            }}
          />
          <Button
            onClick={handleAddOtherSkill}
            variant="outlined"
            sx={{
              borderColor: "var(--violet)",
              color: "var(--violet)",
              "&:hover": {
                borderColor: "var(--violet-hover)",
                backgroundColor: "rgba(109, 40, 217, 0.04)",
              },
            }}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Display added skills */}
      {formik.values.skills.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Your Selected Skills:</p>
          <div className="flex flex-wrap gap-2">
            {formik.values.skills.map((skill, index) => (
              <div
                key={index}
                className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  className="ml-2 text-purple-600 hover:text-purple-800"
                  onClick={() => {
                    formik.setFieldValue(
                      "skills",
                      formik.values.skills.filter((_, i) => i !== index)
                    );
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* <Header /> */}
      <motion.div className="min-h-screen flex flex-col md:flex-row pt-[4rem] md:pt-0">
        {/* Left Section with Image */}
        <div className="hidden md:flex w-1/2 bg-[var(--bg-violet)] relative overflow-hidden justify-center items-end">
          <div className="absolute inset-0 pattern-bg opacity-10"></div>
          <img
            src="https://res.cloudinary.com/daee3szbl/image/upload/v1750763232/sgn_oe7aqc.jpg"
            alt="trainer-tools-bg"
            className="absolute inset-0 w-full h-full object-cover brightness-90"
            loading="lazy"
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
                Create your{" "}
                {userType === "client"
                  ? ""
                  : userType === "trainer"
                  ? "trainer"
                  : ""}{" "}
                account
                {userType === "trainer" && ` - Step ${currentStep} of 3`}
              </h2>
              <p className="text-muted-foreground mt-2">
                {currentStep === 1
                  ? "Enter your details to get started"
                  : currentStep === 2
                  ? "Tell us about yourself"
                  : "What are your specialties?"}
              </p>
            </div>

            <form className="space-y-2" onSubmit={formik.handleSubmit}>
              {/* Form Steps with Animation */}
              <AnimatePresence mode="wait">
                {userType === "trainer" && currentStep === 2 ? (
                  <motion.div
                    key="trainer-step2"
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    {renderTrainerPersonalInfo()}
                  </motion.div>
                ) : userType === "trainer" && currentStep === 3 ? (
                  <motion.div
                    key="trainer-step3"
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    {renderTrainerSkills()}
                  </motion.div>
                ) : (
                  <motion.div
                    key="basic-info"
                    initial={{
                      x: userType === "trainer" ? -300 : 0,
                      opacity: userType === "trainer" ? 0 : 1,
                    }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 300, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    {renderBasicInfoForm()}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Terms & Conditions */}
              <div className="flex items-center justify-end space-x-2">
                <div className="flex items-center gap-1.5">
                  <label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground"
                  >
                    Already have an account?{" "}
                  </label>
                  <span
                    onClick={setLogin}
                    className="text-[var(--violet)] hover:text-[var(--violet-hover)] cursor-pointer"
                  >
                    Login Now!
                  </span>
                </div>
              </div>

              {/* Navigation and Submit Buttons */}
              <div
                className={`flex ${
                  userType === "trainer" &&
                  (currentStep === 2 || currentStep === 3)
                    ? "justify-between"
                    : "justify-center"
                } gap-4`}
              >
                {userType === "trainer" &&
                  (currentStep === 2 || currentStep === 3) && (
                    <Button
                      type="button"
                      onClick={handlePrevStep}
                      variant="outlined"
                      startIcon={<ArrowLeft size={16} />}
                      sx={{
                        borderColor: "var(--violet)",
                        color: "var(--violet)",
                        "&:hover": {
                          borderColor: "var(--violet-hover)",
                          backgroundColor: "rgba(109, 40, 217, 0.04)",
                        },
                      }}
                    >
                      Back
                    </Button>
                  )}

                <Button
                  type="submit"
                  disabled={isLoading || isSendOtpPending || isVerifyOtpPending}
                  fullWidth={
                    !(
                      userType === "trainer" &&
                      (currentStep === 2 || currentStep === 3)
                    )
                  }
                  variant="contained"
                  endIcon={
                    userType === "trainer" &&
                    (currentStep === 1 || currentStep === 2) ? (
                      <ArrowRight size={16} />
                    ) : undefined
                  }
                  sx={{
                    backgroundColor: "#6d28d9",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#5b21b6",
                    },
                    "&.Mui-disabled": {
                      backgroundColor: "#6d28d9",
                      opacity: 0.7,
                      color: "white",
                    },
                  }}
                >
                  {isLoading || isSendOtpPending || isVerifyOtpPending ? (
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
                      {userType === "trainer"
                        ? currentStep === 1
                          ? "Next Step"
                          : currentStep === 2
                          ? "Next Step"
                          : "Create Account"
                        : "Create Account"}
                    </span>
                  ) : userType === "trainer" ? (
                    currentStep === 1 ? (
                      "Next Step"
                    ) : currentStep === 2 ? (
                      "Next Step"
                    ) : (
                      "Create Account"
                    )
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>

              {/* Social SignUp */}
              <div className="text-center my-4 text-muted-foreground text-xs">
                OR
              </div>
              <GoogleAuthButton handleGoogleSuccess={handleGoogleAuth} />
            </form>
          </motion.div>
        </div>
      </motion.div>
      <OTPModal
        isOpen={isOTPModalOpen}
        onClose={handleCloseOTPModal}
        onVerify={handleVerifyOTP}
        onResend={handleSendOTP}
        isSending={isSending}
      />
    </>
  );
};

export default SignUp;
