"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToaster } from "@/hooks/ui/useToaster";
import AnimatedBackground from "@/components/Animation/AnimatedBackgorund";
import AnimatedTitle from "@/components/Animation/AnimatedTitle";
import { motion, AnimatePresence } from "framer-motion";
import { useClientProfile } from "@/hooks/client/useClientProfile";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";


export default function TrainerSelectionPromptPage() {
  const navigate = useNavigate();
  const { infoToast } = useToaster();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
   const client = useSelector((state: RootState) => state.client.client);
  const { data: clientProfile, isLoading, error } = useClientProfile(client?.id || null);

  const images = [
    "https://res.cloudinary.com/daee3szbl/image/upload/v1750761630/trainer1_ptthds.jpg",
    "https://res.cloudinary.com/daee3szbl/image/upload/v1750761627/trainer2_y70waf.jpg",
    "https://res.cloudinary.com/daee3szbl/image/upload/v1750761498/trainer4_hioepm.jpg"
  ];

  useEffect(() => {
    if (clientProfile?.isPremium && clientProfile?.selectStatus === "accepted") {
      infoToast("You already have an assigned trainer!");
      navigate("/dashboard"); 
    }
  }, [clientProfile, navigate, infoToast]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); 

    return () => clearInterval(intervalId);
  }, []);

  const handleAutoSelection = () => {
    infoToast("Please provide your preferences for automatic trainer selection");
    navigate("/trainer-preferences?mode=auto");
  };

  const handleManualSelection = () => {
    infoToast("Navigating to manual trainer selection");
    navigate("/trainer-selection/manual?mode=manual");
  };

  if (isLoading) {
    return (
      <AnimatedBackground>
        <div className="flex min-h-screen flex-col items-center justify-center w-full px-4 py-6">
          <p className="text-gray-700">Loading...</p>
        </div>
      </AnimatedBackground>
    );
  }

  if (error) {
    return (
      <AnimatedBackground>
        <div className="flex min-h-screen flex-col items-center justify-center w-full px-4 py-6">
          <p className="text-red-500">{error.message || "Error loading profile"}</p>
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <div className="flex min-h-screen flex-col items-center justify-center w-full px-4 py-6">
        <div className="w-full px-2 sm:px-4 lg:px-6 max-w-5xl">
          {/* Smaller Hero Title Section */}
          <div className="mb-6 sm:mb-8 pt-4">
            <AnimatedTitle
              title="Find Your Perfect Trainer"
              subtitle="Personalized coaching tailored to your fitness journey and goals"
              className="text-2xl sm:text-3xl md:text-4xl"
            />
          </div>

          {/* Main Content Section - Made more compact */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-gray-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px] lg:min-h-[450px]">
              {/* Image Column with Smooth Transitions */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="relative h-64 md:h-full overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    initial={{ opacity: .15 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: .15 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    src={images[currentImageIndex]}
                    alt="Personal trainer session"
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 sm:p-6">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-white text-xl sm:text-2xl font-bold mb-2"
                  >
                    Expert Guidance
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    className="text-white/90 text-sm sm:text-base"
                  >
                    Our certified trainers provide customized programs to help you achieve your fitness goals faster and safer.
                  </motion.p>
                </div>
              </motion.div>

              {/* Content Column */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="p-4 sm:p-6 md:p-8 flex flex-col justify-center"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">How would you like to proceed?</h3>
                <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
                  Choose your preferred method for selecting a personal trainer that matches your unique requirements and training style.
                </p>

                <div className="flex flex-col gap-3 sm:gap-4 w-full">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleAutoSelection}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm sm:text-base py-3 sm:py-4 rounded-lg transition-all shadow-md hover:shadow-indigo-200/50"
                    >
                      <span className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 sm:h-5 sm:w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        Automatic Trainer Matching
                      </span>
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleManualSelection}
                      variant="outline"
                      className="w-full border-2 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 text-gray-800 font-semibold text-sm sm:text-base py-3 sm:py-4 rounded-lg transition-all"
                    >
                      <span className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 sm:h-5 sm:w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Browse & Select Manually
                      </span>
                    </Button>
                  </motion.div>
                </div>

                <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 italic">
                  You can change your trainer at any time after your initial selection
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatedBackground>
  );
}