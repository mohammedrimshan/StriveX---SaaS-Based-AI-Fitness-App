"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useSelector } from "react-redux"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import ProfileDetails from "./ProfileComponent/ProfileDetials"
import ChangePassword from "./ProfileComponent/ChangePassword"
export default function TrainerProfilePage() {
  const trainer = useSelector((state: any) => state.trainer.trainer)
  console.log("Trainer detials",trainer)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-6xl"
      >
        <h1 className="mb-6 text-3xl font-bold text-violet-700">Trainer Profile</h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-8 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="profile" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              Profile
            </TabsTrigger>
            <TabsTrigger value="password" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              Change Password
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-0">
              <ProfileDetails trainer={trainer} />
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card className="p-0">
              <ChangePassword />
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

