"use client"

import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useClientProfile } from "@/hooks/client/useClientProfile";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SelectedTrainers from "@/components/BackupTrainer/SelectedTrainers";
import UserTrainerInvitation from "@/components/BackupTrainer/UserTrainerInvitation";
import UserBackupTrainerRequestList from "@/components/BackupTrainer/UserBackupTrainerRequestList";
import AnimatedBackground from "@/components/Animation/AnimatedBackgorund";
import AnimatedTitle from "@/components/Animation/AnimatedTitle";

export default function TrainerManagement() {
  const navigate = useNavigate();
  const { client } = useSelector((state: RootState) => ({
    client: state.client.client,
  }));
  const { data: clientProfile, error: profileError } = useClientProfile(client?.id || null);

  // Redirect or show restricted message if user is not premium
  if (profileError) {
    return (
      <div className="py-16 text-center text-red-500">
        {profileError?.message || "Error loading profile"}
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="text-5xl mb-4">👋</div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Welcome</h2>
          <p className="text-slate-600">Please log in to access trainer management</p>
        </div>
      </div>
    );
  }

  if (clientProfile && (!clientProfile.isPremium || clientProfile.selectStatus !== "accepted")) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Premium Feature</h2>
          <p className="text-slate-600 mb-4">
            Please select a trainer and upgrade to premium to access trainer management
          </p>
          <button
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            onClick={() => navigate("/premium")}
          >
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnimatedBackground>
      <div className="min-h-screen mt-15">
        <div className="container mx-auto px-4 py-8">
          <AnimatedTitle
            title="Trainer Management"
            subtitle="Manage your trainers, invitations, and requests with ease"
            className="mb-12"
          />

          <Tabs defaultValue="selected" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg">
              <TabsTrigger
                value="selected"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-medium"
              >
                Selected Trainers
              </TabsTrigger>
              <TabsTrigger
                value="invitations"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-medium"
              >
                Trainer Invitations
              </TabsTrigger>
              <TabsTrigger
                value="requests"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-medium"
              >
                Backup Requests
              </TabsTrigger>
            </TabsList>

            <TabsContent value="selected" className="mt-0">
              <SelectedTrainers />
            </TabsContent>

            <TabsContent value="invitations" className="mt-0">
              <UserTrainerInvitation />
            </TabsContent>

            <TabsContent value="requests" className="mt-0">
              <UserBackupTrainerRequestList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AnimatedBackground>
  );
}