"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import SessionHistory from "../SessionHistory/SessionHistory";
import { UserRole } from "@/types/UserRole";
import { useClientProfile } from "@/hooks/client/useClientProfile";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const SessionHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const admin = useSelector((state: RootState) => state.admin.admin);
  const client = useSelector((state: RootState) => state.client.client);
  const trainer = useSelector((state: RootState) => state.trainer.trainer);

  const userRole: UserRole = admin
    ? "admin"
    : trainer
      ? "trainer"
      : client
        ? "client"
        : "client";

  const { data: clientProfile, isLoading: profileLoading, error: profileError } = useClientProfile(
    userRole === "client" && client ? client.id : null
  );

  if (userRole === "client" && (profileError || !client)) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="text-5xl mb-4">👋</div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Welcome</h2>
          <p className="text-slate-600">{profileError?.message || "Please log in to access session history"}</p>
        </div>
      </div>
    );
  }

  // Show loading state while checking profile
  if (userRole === "client" && profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-violet-500 border-violet-200 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 font-medium">Checking your account...</p>
        </div>
      </div>
    );
  }

  // Check if client is premium and has accepted status
  if (userRole === "client" && clientProfile && (!clientProfile.isPremium || clientProfile.selectStatus !== "accepted")) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center p-8 bg-white rounded-xl shadow-2xl max-w-md border border-violet-100"
        >
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Premium Feature</h2>
          <p className="text-slate-600 mb-6">
            Please select a trainer and upgrade to premium to access session history
          </p>
          <Button
            onClick={() => navigate('/premium')} 
            className="px-6 py-3 bg-gradient-to-r from-[#6d28d9] to-[#a21caf] hover:from-[#5b21b6] hover:to-[#86198f] text-white rounded-lg transition-all transform hover:scale-105"
          >
            Upgrade to Premium
          </Button>
        </motion.div>
      </div>
    );
  }

  return <SessionHistory role={userRole} />;
};

export default SessionHistoryPage;