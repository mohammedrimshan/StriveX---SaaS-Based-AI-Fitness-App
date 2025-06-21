"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useClientProfile } from "@/hooks/client/useClientProfile";
import { Button } from "@/components/ui/button";
import { UserCheck, Lock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SubscriptionCountdownProps {
  subscriptionEndDate: string;
  embedded?: boolean; // Optional prop to control styling when embedded in other components
}

const SubscriptionCountdown: React.FC<SubscriptionCountdownProps> = ({ subscriptionEndDate, embedded = false }) => {
  const navigate = useNavigate();
  const { client } = useSelector((state: RootState) => ({
    client: state.client.client,
  }));

  // Get client profile to check premium status
  const { data: clientProfile, isLoading: profileLoading, error: profileError } = useClientProfile(client?.id || null);

  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const end = new Date(subscriptionEndDate).getTime();
    const difference = end - now;

    // Return zeros if date is invalid or in the past
    if (!subscriptionEndDate || isNaN(end) || difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)) || 0,
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24) || 0,
      minutes: Math.floor((difference / (1000 * 60)) % 60) || 0,
      seconds: Math.floor((difference / 1000) % 60) || 0,
    };
  };

  // Get base container classes based on whether component is embedded
  const getContainerClasses = () => {
    if (embedded) {
      return ""; 
    }
    return "bg-white rounded-2xl p-6   transition-all duration-300";
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      const updatedTimeLeft = calculateTimeLeft();
      setTimeLeft(updatedTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [subscriptionEndDate]);

  // Handle profile errors or no user
  if (profileError || !client) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={getContainerClasses()}
      >
        <div className="text-center">
          <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Welcome</h3>
          <p className="text-gray-600">{profileError?.message || "Please log in to access subscription details"}</p>
        </div>
      </motion.div>
    );
  }

  // Show loading state while checking profile
  if (profileLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={getContainerClasses()}
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Checking your account...</p>
        </div>
      </motion.div>
    );
  }

  // Check if client is premium and has accepted status
  if (clientProfile && (!clientProfile.isPremium)) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={getContainerClasses()}
      >
        <div className="text-center">
         <Lock className="w-6 h-6 text-gray-400 mx-auto mb-4" />

          <h3 className="text-xl font-bold text-gray-800 mb-2">Premium Feature</h3>
          <p className="text-gray-600 mb-4">
            Please select a trainer and upgrade to premium to access subscription details
          </p>
          <Button
            onClick={() => navigate("/premium")}
            className="px-6 py-3 bg-gradient-to-r from-[#6d28d9] to-[#a21caf] hover:from-[#5b21b6] hover:to-[#86198f] text-white rounded-lg transition-all transform hover:scale-105"
          >
            Take Premium
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={getContainerClasses()}
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4">Subscription Countdown</h3>
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Time until subscription ends:</p>
        <div className="flex justify-center space-x-4 text-lg font-semibold text-gray-800">
          <div>
            <span className="block text-2xl text-blue-600">{timeLeft.days}</span>
            <span className="text-xs text-gray-500">Days</span>
          </div>
          <div>
            <span className="block text-2xl text-blue-600">{timeLeft.hours}</span>
            <span className="text-xs text-gray-500">Hours</span>
          </div>
          <div>
            <span className="block text-2xl text-blue-600">{timeLeft.minutes}</span>
            <span className="text-xs text-gray-500">Minutes</span>
          </div>
          <div>
            <span className="block text-2xl text-blue-600">{timeLeft.seconds}</span>
            <span className="text-xs text-gray-500">Seconds</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SubscriptionCountdown;