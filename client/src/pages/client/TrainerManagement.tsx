"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SelectedTrainers from "@/components/BackupTrainer/SelectedTrainers"
import UserTrainerInvitation from "@/components/BackupTrainer/UserTrainerInvitation"
import UserBackupTrainerRequestList from "@/components/BackupTrainer/UserBackupTrainerRequestList"
import AnimatedBackground from "@/components/Animation/AnimatedBackgorund"
import AnimatedTitle from "@/components/Animation/AnimatedTitle"

export default function TrainerManagement() {
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
  )
}