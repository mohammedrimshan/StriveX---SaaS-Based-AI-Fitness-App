"use client"

import VideoCall from "./VideoCall"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, User, Mail, Video, Shield, Clock, AlertTriangle } from "lucide-react"

interface VideoCallPageProps {
  userType: "trainer" | "client"
}

interface UserInfo {
  displayName: string
  email: string
  avatar?: string
}

export default function VideoCallPage({ userType }: VideoCallPageProps) {
  const { slotId } = useParams<{ slotId: string }>()
  const navigate = useNavigate()

  // Log the extracted slotId and userType
  console.log("VideoCallPage Extracted Values:", { slotId, userType })

  const user = useSelector((state: RootState) => {
    const selectedUser = userType === "trainer" ? state.trainer.trainer : state.client?.client
    console.log(`Redux State (${userType}):`, selectedUser)
    return selectedUser
  })

  // Construct userInfo from Redux state
  const userId = user?.id
  const userInfo: UserInfo | null = user
    ? {
        displayName: `${user.firstName || "User"} ${user.lastName || ""}`.trim() || "Anonymous",
        email: user.email || "no-email@example.com",
        avatar: user.profileImage || undefined,
      }
    : null

  // Log all derived values
  console.log("Derived Values:", { slotId, userId, userInfo, role: userType })

  const loginPath = userType === "trainer" ? "/trainer/login" : "/client/login"

  useEffect(() => {
    if (!userId || !slotId) {
      console.log("Redirecting to login due to missing data:", { userId, slotId })
      navigate(loginPath)
    }
  }, [userId, slotId, navigate, loginPath])

  // Missing data state
  if (!userId || !userInfo || !slotId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4 ">
        <Card className="w-full max-w-md shadow-lg border-red-200">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-600">Missing required authentication data. Please log in to continue.</p>
            <Button onClick={() => navigate(loginPath)} className="w-full bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-15">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Back button and title */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Video className="h-5 w-5 text-blue-600" />
                <h1 className="text-lg font-semibold text-gray-900">Video Call Session</h1>
              </div>
            </div>

            {/* Right side - User info */}
            <div className="flex items-center space-x-3">
              <Badge
                variant={userType === "trainer" ? "default" : "secondary"}
                className={userType === "trainer" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}
              >
                <Shield className="mr-1 h-3 w-3" />
                {userType === "trainer" ? "Trainer" : "Client"}
              </Badge>

              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{userInfo.displayName}</p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <Mail className="mr-1 h-3 w-3" />
                    {userInfo.email}
                  </p>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userInfo.avatar || "/placeholder.svg"} alt={userInfo.displayName} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session Info Bar */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Session ID: {slotId}</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
              <div className="hidden sm:flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Session</span>
              </div>
            </div>

            <div className="text-xs text-gray-500">Secure video call powered by Zego</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <VideoCall slotId={slotId} userId={userId} role={userType} userInfo={userInfo} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center text-xs text-gray-500">
            <Shield className="mr-1 h-3 w-3" />
            End-to-end encrypted video call
          </div>
        </div>
      </div>
    </div>
  )
}
