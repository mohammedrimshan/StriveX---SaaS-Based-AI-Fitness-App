// TrainerPostRegistrationForm.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useToaster } from "@/hooks/ui/useToaster";
import { trainerLogin } from "@/store/slices/trainer.slice";
import { usePostRegistration } from "@/hooks/auth/postRegister";
import { validateStep, personalInfoSchema, skillsSchema } from "@/utils/validations/post-register.validator";
import { createContext, useContext } from "react";
import FormProgress from "@/components/common/Progress/form.progress";

// API function to complete registration
import { completeTrainerRegistration } from "@/services/trainer/trainerService";
// Define form context types
interface FormContextType {
  formData: FormData;
  updateFormData: (stepData: Partial<FormData>) => void;
}

// Define form data structure
interface FormData {
  profileImage: string;
  dateOfBirth: string;
  experience: number;
  gender: string;
  skills: {
    nutrition: boolean;
    posture: boolean;
    mindfulness: boolean;
    muscleBuilding: boolean;
    strengthTraining: boolean;
    weightLoss: boolean;
    stressManagement: boolean;
    flexibility: boolean;
    coreStrengthening: boolean;
  };
}

// Create form context
const FormContext = createContext<FormContextType | undefined>(undefined);

// Custom hook to use form context
export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
};

// Form provider component
export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<FormData>({
    profileImage: "",
    dateOfBirth: "",
    experience: 0,
    gender: "",
    skills: {
      nutrition: false,
      posture: false,
      mindfulness: false,
      muscleBuilding: false,
      strengthTraining: false,
      weightLoss: false,
      stressManagement: false,
      flexibility: false,
      coreStrengthening: false,
    }
  });

  const updateFormData = (stepData: Partial<FormData>) => {
    setFormData(prevData => ({
      ...prevData,
      ...stepData
    }));
  };

  return (
    <FormContext.Provider value={{ formData, updateFormData }}>
      {children}
    </FormContext.Provider>
  );
};

// Personal Info Form Component
const PersonalInfoForm: React.FC<{
  onNext: () => void;
  onSubmit: (values: any) => void;
  initialValues: any;
}> = ({ onNext, onSubmit, initialValues }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formValues, setFormValues] = useState(initialValues);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? Number(value) : value;
    setFormValues({
      ...formValues,
      [name]: newValue
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = await validateStep("personalInfo", formValues);
    
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formValues);
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Personal Information</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image Upload */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-32 h-32 rounded-full bg-gray-200 mb-2 flex items-center justify-center overflow-hidden">
            {formValues.profileImage ? (
              <img 
                src={formValues.profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <label className="cursor-pointer text-indigo-600 hover:text-indigo-800">
            Upload Photo
            <input 
              type="file" 
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormValues({
                      ...formValues,
                      profileImage: reader.result as string
                    });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </label>
          {errors.profileImage && (
            <p className="text-red-500 text-sm mt-1">{errors.profileImage}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formValues.dateOfBirth}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.dateOfBirth && (
            <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
          )}
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Years of Experience
          </label>
          <input
            type="number"
            name="experience"
            min="0"
            max="50"
            value={formValues.experience}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.experience && (
            <p className="text-red-500 text-sm mt-1">{errors.experience}</p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select
            name="gender"
            value={formValues.gender}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="" disabled>Select your gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
          {errors.gender && (
            <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
};

// Skills Form Component
const SkillsForm: React.FC<{
  onPrev: () => void;
  onSubmit: (values: any) => void;
  initialValues: any;
}> = ({ onPrev, onSubmit, initialValues }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formValues, setFormValues] = useState(initialValues);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormValues({
      skills: {
        ...formValues.skills,
        [name]: checked
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = await validateStep("skills", formValues);
    
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formValues);
    } else {
      setErrors(validationErrors);
    }
  };

  const skills = [
    { id: "nutrition", label: "Nutrition & Diet" },
    { id: "posture", label: "Posture Correction" },
    { id: "mindfulness", label: "Mindfulness & Meditation" },
    { id: "muscleBuilding", label: "Muscle Building" },
    { id: "strengthTraining", label: "Strength Training" },
    { id: "weightLoss", label: "Weight Loss" },
    { id: "stressManagement", label: "Stress Management" },
    { id: "flexibility", label: "Flexibility & Mobility" },
    { id: "coreStrengthening", label: "Core Strengthening" },
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Specializations</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((skill) => (
            <div key={skill.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                id={skill.id}
                name={skill.id}
                checked={formValues.skills[skill.id as keyof typeof formValues.skills]}
                onChange={handleChange}
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor={skill.id} className="text-gray-700 cursor-pointer select-none">
                {skill.label}
              </label>
            </div>
          ))}
        </div>
        {errors.skills && (
          <p className="text-red-500 text-sm mt-1">{errors.skills}</p>
        )}

        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={onPrev}
            className="w-1/2 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition duration-300"
          >
            Back
          </button>
          <button
            type="submit"
            className="w-1/2 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300"
          >
            Complete Registration
          </button>
        </div>
      </form>
    </div>
  );
};

// Main Post-Registration Form Component
const TrainerPostRegistrationForm = () => {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formData, updateFormData } = useFormContext();
  const totalSteps = 2;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { errorToast, successToast } = useToaster();

  // Get email from session storage (set during signup)
  const registeredEmail = sessionStorage.getItem('registeredEmail');

  const { mutate: completeRegistration } = usePostRegistration(
    (userData) => completeTrainerRegistration(userData)
  );

  const nextStep = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const goToStep = (index: number) => {
    setStep(index);
  };

  const handlePersonalInfoSubmit = (values: any) => {
    updateFormData(values);
    nextStep();
  };

  const handleSkillsSubmit = (values: any) => {
    setIsSubmitting(true);
    updateFormData(values);
    
    // Combine all form data
    const completeFormData = {
      ...formData,
      ...values,
      email: registeredEmail, // Include the email for identification
    };
    
    // Send data to API
    completeRegistration(completeFormData, {
      onSuccess: (data) => {
        // Clear session storage
        sessionStorage.removeItem('pendingProfileSetup');
        sessionStorage.removeItem('registeredEmail');
        
        // Update Redux store with user data
        dispatch(trainerLogin(data.user));
        
        successToast("Registration completed successfully!");
        navigate("/trainer/profileform");
        setIsSubmitting(false);
      },
      onError: (error: any) => {
        errorToast(error?.response?.data?.message || "Failed to complete registration");
        setIsSubmitting(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-lg overflow-hidden shadow-xl">
        <div className="bg-indigo-600 py-4">
          <h1 className="text-center text-2xl font-bold text-white">Complete Your Trainer Profile</h1>
          <p className="text-center text-indigo-100 mt-1">
            Help clients find you by completing your profile
          </p>
        </div>
        
        <div className="relative">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="personal-info"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <PersonalInfoForm 
                  onNext={nextStep} 
                  onSubmit={handlePersonalInfoSubmit}
                  initialValues={{
                    profileImage: formData.profileImage,
                    dateOfBirth: formData.dateOfBirth,
                    experience: formData.experience,
                    gender: formData.gender
                  }}
                />
              </motion.div>
            )}
            {step === 1 && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <SkillsForm 
                  onPrev={prevStep} 
                  onSubmit={handleSkillsSubmit}
                  initialValues={{ skills: formData.skills }}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <FormProgress currentStep={step} totalSteps={totalSteps} onStepClick={goToStep} />
          </div>
        </div>
      </div>
      
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-medium">Completing your registration...</p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-indigo-600 h-2.5 rounded-full animate-pulse w-full"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerPostRegistrationForm;