"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt"
import { useNavigate } from "react-router-dom"
import { clientAxiosInstance } from "@/api/client.axios"
import { trainerAxiosInstance } from "@/api/trainer.axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PermissionsHelpModal } from "@/components/modals/PermissionsHelpModal"
import {
  Video,
  Phone,
  PhoneCall,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  Camera,
  Settings,
  Monitor,
} from "lucide-react"

interface VideoCallProps {
  slotId: string
  userId: string
  role: "trainer" | "client"
  userInfo: {
    displayName: string
    email: string
    avatar?: string
  }
}

interface VideoCallDetails {
  roomName: string
  token: string
}

const SOCKET_URL = "https://api.strivex.rimshan.in" // Update with your actual socket URL
const SOCKET_PATH = "/socket.io/video"
const ZEGO_APP_ID = Number.parseInt(import.meta.env.VITE_ZEGO_APP_ID || "201333030")
const ZEGO_SERVER_SECRET = import.meta.env.VITE_ZEGO_SERVER_SECRET || "dba3a1533b1aff4cb9ecc3350401a713"

const getAxiosInstance = (role: "trainer" | "client") => {
  return role === "trainer" ? trainerAxiosInstance : clientAxiosInstance
}

const getPrefix = (role: "trainer" | "client") => {
  return role === "trainer" ? "/trainer" : "/client"
}

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
  return match ? decodeURIComponent(match[2]) : null
}

const requestCameraPermissions = async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    console.log("Camera permissions granted")
    return { granted: true, message: "" }
  } catch (err: any) {
    console.error("Failed to get camera permissions:", err)
    if (err.name === "NotAllowedError") {
      return {
        granted: false,
        message: "Camera and microphone access was denied by the user.",
      }
    } else if (err.name === "NotFoundError") {
      return {
        granted: false,
        message: "No camera or microphone found on this device.",
      }
    } else if (err.name === "NotReadableError") {
      return {
        granted: false,
        message: "Camera or microphone is already in use by another application.",
      }
    }
    return {
      granted: false,
      message: "Failed to access camera and microphone.",
    }
  }
}

const logWithTimestamp = (message: string, data?: any) => {
  const timestamp = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date())
  console.log(`[${timestamp} IST] ${message}`, data)
}

const VideoCall: React.FC<VideoCallProps> = ({ slotId, userId, role, userInfo }) => {
  logWithTimestamp("VideoCall Props:", { slotId, userId, role, userInfo })
  logWithTimestamp("SOCKET_URL:", SOCKET_URL)
  logWithTimestamp("ZEGO Config:", {
    ZEGO_APP_ID,
    ZEGO_SERVER_SECRET: ZEGO_SERVER_SECRET ? "[SET]" : "[UNSET]",
  })

  const [videoCallDetails, setVideoCallDetails] = useState<VideoCallDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCallEnded, setIsCallEnded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRoomStarted, setIsRoomStarted] = useState(false)
  const [permissionsGranted, setPermissionsGranted] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")
  const socketRef = useRef<Socket | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const zegoClientRef = useRef<ZegoUIKitPrebuilt | null>(null)
  const navigate = useNavigate()

  const checkPermissions = async () => {
    const result = await requestCameraPermissions()
    logWithTimestamp("Camera permissions result:", result)
    setPermissionsGranted(result.granted)
    if (!result.granted) {
      setError(result.message)
    }
  }

  useEffect(() => {
    checkPermissions()
  }, [])

  useEffect(() => {
    const fetchVideoCallDetails = async () => {
      try {
        setIsLoading(true)
        const axiosInstance = getAxiosInstance(role)
        const prefix = getPrefix(role)
        const endpoint = `${prefix}/video-call/${slotId}`
        logWithTimestamp(`Fetching video call details for ${role} at endpoint:`, {
          endpoint,
          baseURL: axiosInstance.defaults.baseURL,
        })
        const response = await axiosInstance.get(endpoint)
        logWithTimestamp("Video call details response:", response.data)

        const { success, videoCallDetails: details } = response.data

        if (success && details?.roomName && details?.token) {
          logWithTimestamp("Valid video call details received:", {
            roomName: details.roomName,
          })
          setVideoCallDetails(details)
          setIsRoomStarted(true)
          setError(null)
        } else {
          logWithTimestamp("Incomplete video call details or call not ready:", response.data)
          setVideoCallDetails(null)
          setError("Video call not started yet")
          setTimeout(fetchVideoCallDetails, 5000)
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || "Failed to fetch video call details"
        console.error("Error fetching video call details:", errorMessage, err)
        logWithTimestamp("Fetch error:", {
          errorMessage,
          status: err.response?.status,
        })
        setError(errorMessage)
        setTimeout(fetchVideoCallDetails, 5000)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVideoCallDetails()
  }, [slotId, role])

  useEffect(() => {
    if (socketRef.current) return

    const token = getCookie(role === "trainer" ? "trainer_access_token" : "client_access_token")
    logWithTimestamp("Token from cookie:", token ? "[SET]" : "[UNSET]")

    socketRef.current = io(`${SOCKET_URL}${SOCKET_PATH}`, {
      query: { userId },
      auth: token ? { token } : { userId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 30000,
    })

    socketRef.current.on("connect", () => {
      logWithTimestamp("Connected to Socket.io")
      setConnectionStatus("connected")
      socketRef.current!.emit("register", {
        userId,
        role,
        token: token || userId,
      })
    })

    socketRef.current.on("connect_error", (err: Error) => {
      console.error("Socket connection error:", err.message, err)
      setConnectionStatus("disconnected")
      setError(`Socket connection failed: ${err.message}. Retrying...`)
    })

    socketRef.current.on("registerSuccess", ({ userId: registeredUserId }: { userId: string }) => {
      logWithTimestamp(`Registered successfully as ${registeredUserId}`)
    })

    socketRef.current.on("videoCallStarted", (data: { slotId: string; roomName: string; videoCallStatus: string }) => {
      logWithTimestamp("videoCallStarted event received:", data)
      if (data.slotId === slotId && data.roomName) {
        setVideoCallDetails((prev) => (prev ? { ...prev, roomName: data.roomName } : null))
        setIsRoomStarted(true)
        setError(null)
      }
    })

    socketRef.current.on("videoCallJoined", (data: { slotId: string; roomName: string }) => {
      logWithTimestamp("videoCallJoined event received:", data)
      if (data.slotId === slotId && data.roomName) {
        setVideoCallDetails((prev) => (prev ? { ...prev, roomName: data.roomName } : null))
        setHasJoined(true)
        setError(null)
      }
    })

    socketRef.current.on("videoCallEnded", (data: { slotId: string; videoCallStatus: string }) => {
      logWithTimestamp("videoCallEnded event received:", data)
      if (data.slotId === slotId && data.videoCallStatus === "ENDED") {
        setIsCallEnded(true)
        setVideoCallDetails(null)
        setIsRoomStarted(false)
        setHasJoined(false)
        setError(null)
      }
    })

    socketRef.current.on("error", (data: { message: string }) => {
      console.error("Socket error:", data.message, data)
      setError(data.message)
    })

    return () => {
      logWithTimestamp("Disconnecting Socket.io")
      if (socketRef.current?.connected) {
        socketRef.current.disconnect()
      }
    }
  }, [slotId, userId, role])

  const handleStartCall = async () => {
    try {
      logWithTimestamp(`Starting video call for slot ${slotId} as ${role}`)
      const axiosInstance = getAxiosInstance(role)
      const prefix = getPrefix(role)
      const response = await axiosInstance.post(`${prefix}/video-call/start/${slotId}`, { userId, role })
      logWithTimestamp("Start call response:", response.data)
      setIsRoomStarted(true)
      setHasJoined(true)
      if (socketRef.current) {
        socketRef.current.emit("startVideoCall", { slotId, userId, role })
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to start video call"
      console.error("Start call error:", errorMessage, err)
      setError(errorMessage)
    }
  }

  const handleJoinCall = async () => {
    try {
      logWithTimestamp(`Joining video call for slot ${slotId} as ${role}`)
      const axiosInstance = getAxiosInstance(role)
      const prefix = getPrefix(role)
      const response = await axiosInstance.post(`${prefix}/video-call/join/${slotId}`, { userId, role })
      logWithTimestamp("Join call response:", response.data)
      setHasJoined(true)
      if (socketRef.current) {
        socketRef.current.emit("joinVideoCall", { slotId, userId, role })
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to join video call"
      console.error("Join call error:", errorMessage, err)
      setError(errorMessage)
    }
  }

  const handleEndCall = async () => {
    try {
      logWithTimestamp(`Ending video call for slot ${slotId} as ${role}`)
      const axiosInstance = getAxiosInstance(role)
      const prefix = getPrefix(role)
      const response = await axiosInstance.post(`${prefix}/video-call/${slotId}/end`, { userId, role })
      logWithTimestamp("End call response:", response.data)
      if (socketRef.current) {
        socketRef.current.emit("endVideoCall", { slotId, userId, role })
      }
      if (zegoClientRef.current) {
        zegoClientRef.current.destroy()
        zegoClientRef.current = null
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to end video call"
      console.error("End call error:", errorMessage, err)
      setError(errorMessage)
    }
  }

  useEffect(() => {
    if (!containerRef.current || !videoCallDetails || !permissionsGranted || !isRoomStarted || !hasJoined) return

    const initializeZegoClient = async () => {
      if (zegoClientRef.current) {
        logWithTimestamp("Cleaning up existing Zego client")
        zegoClientRef.current.destroy()
        zegoClientRef.current = null
      }

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Your browser does not support WebRTC. Please use Chrome, Firefox, or Edge.")
        }

        logWithTimestamp("Attempting to initialize ZegoUIKit with token")

        let kitToken = videoCallDetails.token
        console.log(kitToken," kitToken from videoCallDetails")
        if (ZEGO_APP_ID && ZEGO_SERVER_SECRET) {
          try {
            kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
              ZEGO_APP_ID,
              ZEGO_SERVER_SECRET,
              videoCallDetails.roomName,
              userId,
              userInfo.displayName,
              3600,
            )
            logWithTimestamp("Generated kitToken for testing")
          } catch (err) {
            console.error("Failed to generate kitToken:", err)
          }
        }

        const zp = ZegoUIKitPrebuilt.create(kitToken)
        zegoClientRef.current = zp

        // Responsive dimensions for the Zego window
        if (containerRef.current) {
          containerRef.current.style.width = "100%"
          containerRef.current.style.height = "100%"
          containerRef.current.style.minHeight = "400px"
        }

        zp.joinRoom({
          container: containerRef.current,
          sharedLinks: [
            {
              name: "Personal link",
              url: `${window.location.protocol}//${window.location.host}/video-call?slotId=${slotId}`,
            },
          ],
          scenario: {
            mode: ZegoUIKitPrebuilt.VideoConference,
          },
          showPreJoinView: role === "trainer",
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          showScreenSharingButton: true,
          showTextChat: true,
          showUserList: true,
          maxUsers: 2,
          layout: "Auto",
          showLayoutButton: false,
          onJoinRoom: () => {
            logWithTimestamp("Successfully joined room:", videoCallDetails.roomName)
            socketRef.current?.emit("joinVideoCall", { slotId, userId, role })
          },
          onLeaveRoom: () => logWithTimestamp("Left room:", videoCallDetails.roomName),
          onUserJoin: (users) => logWithTimestamp("Users joined:", users),
          onUserLeave: (users) => logWithTimestamp("Users left:", users),
          // @ts-ignore
          onError: (error:any) => {
            console.error("Zego SDK Error:", error)
            setError(`Zego SDK Error: ${error.message || "Unknown error"}`)
            logWithTimestamp("Zego SDK Error:", error)
          },
        })
      } catch (error) {
        const errorMessage = (error as Error).message || "Failed to initialize video call"
        console.error("Error initializing Zego client:", error)
        setError(errorMessage)
        logWithTimestamp("Initialization error:", error)
      }
    }

    initializeZegoClient()

    return () => {
      if (zegoClientRef.current) {
        logWithTimestamp("Cleaning up Zego client on unmount")
        zegoClientRef.current.destroy()
        zegoClientRef.current = null
      }
    }
  }, [videoCallDetails, permissionsGranted, isRoomStarted, hasJoined, slotId, userId, role])

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-b from-slate-50 to-slate-100">
        <Card className="w-full max-w-sm sm:max-w-md mx-auto shadow-xl border border-slate-200 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="flex flex-col items-center space-y-4 sm:space-y-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100 opacity-30 animate-ping"></div>
                <div className="relative bg-indigo-50 rounded-full p-3 sm:p-4">
                  <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-indigo-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">Connecting to Video Call</h3>
                <p className="text-sm sm:text-base text-slate-600">Please wait while we set up your session...</p>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div
                  className={`w-3 h-3 rounded-full ${
                    connectionStatus === "connected" ? "bg-green-500" : "bg-amber-500 animate-pulse"
                  }`}
                ></div>
                <span
                  className={`font-medium ${connectionStatus === "connected" ? "text-green-600" : "text-amber-600"}`}
                >
                  {connectionStatus === "connected" ? "Connected" : "Connecting..."}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Call Ended State
  if (isCallEnded) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-b from-slate-50 to-slate-100">
        <Card className="w-full max-w-sm sm:max-w-md mx-auto shadow-xl border border-green-200 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="flex flex-col items-center space-y-4 sm:space-y-6">
              <div className="bg-green-50 rounded-full p-4 sm:p-5 border-2 border-green-100">
                <CheckCircle className="h-8 w-8 sm:h-12 sm:w-12 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">Call Ended Successfully</h3>
                <p className="text-sm sm:text-base text-slate-600">Thank you for using our video call service</p>
              </div>
              <Button
                onClick={() => navigate(-1)}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-2 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl text-sm sm:text-base"
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Permissions Not Granted State
  if (!permissionsGranted) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-b from-slate-50 to-slate-100">
        <Card className="w-full max-w-sm sm:max-w-lg mx-auto shadow-xl border border-amber-200 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-500"></div>
          <CardHeader className="text-center pb-4">
            <div className="bg-amber-50 rounded-full p-4 sm:p-5 border-2 border-amber-100 mx-auto mb-4">
              <Camera className="h-8 w-8 sm:h-10 sm:w-10 text-amber-600" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800">Camera Access Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6 sm:pb-8">
            <Alert className="border-amber-200 bg-amber-50 text-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm sm:text-base">
                {error ||
                  "Camera and microphone permissions are required to join the video call. Please allow access to continue."}
              </AlertDescription>
            </Alert>

            <div className="space-y-3 sm:space-y-4">
              <Button
                onClick={checkPermissions}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 sm:py-3 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg text-sm sm:text-base"
                size="lg"
              >
                <Camera className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Grant Camera Access
              </Button>

              <Button
                onClick={() => setShowHelpModal(true)}
                variant="outline"
                className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                size="lg"
              >
                <Settings className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                How to Enable Permissions
              </Button>
            </div>
          </CardContent>
        </Card>
        <PermissionsHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
      </div>
    )
  }

  // Room Not Started State
  if (!isRoomStarted) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-b from-slate-50 to-slate-100">
        <Card className="w-full max-w-sm sm:max-w-lg mx-auto shadow-xl border border-indigo-200 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          <CardHeader className="text-center pb-4">
            <div className="bg-indigo-50 rounded-full p-4 sm:p-5 border-2 border-indigo-100 mx-auto mb-4">
              <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-600" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800">
              {role === "trainer" ? "Ready to Start Call" : "Waiting for Call to Start"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6 sm:pb-8">
            <div className="text-center space-y-3">
              <Badge
                variant="outline"
                className="text-xs sm:text-sm px-2 sm:px-3 py-1 border-indigo-200 text-indigo-700 bg-indigo-50"
              >
                <Users className="mr-1 sm:mr-2 h-3 w-3" />
                {role === "trainer" ? "Trainer" : "Client"}
              </Badge>
              <p className="text-sm sm:text-base text-slate-600">
                {error ||
                  (role === "trainer"
                    ? "Click the button below to start the video call session"
                    : "Please wait for the trainer to start the call...")}
              </p>
            </div>

            {role === "trainer" && (
              <Button
                onClick={handleStartCall}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg text-sm sm:text-base"
                size="lg"
              >
                <PhoneCall className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Start Video Call
              </Button>
            )}

            {role === "client" && (
              <div className="flex items-center justify-center space-x-3 py-2 sm:py-3 bg-slate-50 rounded-lg border border-slate-200">
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-indigo-600" />
                <span className="text-sm sm:text-base text-slate-700 font-medium">Waiting for trainer...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Client Waiting to Join State
  if (role === "client" && isRoomStarted && !hasJoined) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-b from-slate-50 to-slate-100">
        <Card className="w-full max-w-sm sm:max-w-lg mx-auto shadow-xl border border-green-200 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
          <CardHeader className="text-center pb-4">
            <div className="bg-green-50 rounded-full p-4 sm:p-5 border-2 border-green-100 mx-auto mb-4">
              <Video className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800">Call is Ready!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6 sm:pb-8">
            <div className="text-center space-y-3">
              <Badge className="bg-green-100 text-green-800 border-green-200 px-2 sm:px-3 py-1 text-xs sm:text-sm">
                <CheckCircle className="mr-1 sm:mr-2 h-3 w-3" />
                Call Active
              </Badge>
              <p className="text-sm sm:text-base text-slate-600">
                The trainer has started the video call. You can now join the session.
              </p>
            </div>

            <Button
              onClick={handleJoinCall}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg text-sm sm:text-base"
              size="lg"
            >
              <Video className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Join Video Call
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error State (non-loading errors)
  if (error && !error.toLowerCase().includes("not started")) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-b from-slate-50 to-slate-100">
        <Card className="w-full max-w-sm sm:max-w-lg mx-auto shadow-xl border border-red-200 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-red-400 to-rose-500"></div>
          <CardHeader className="text-center pb-4">
            <div className="bg-red-50 rounded-full p-4 sm:p-5 border-2 border-red-100 mx-auto mb-4">
              <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800">Connection Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6 sm:pb-8">
            <Alert className="border-red-200 bg-red-50 text-red-800">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm sm:text-base">{error}</AlertDescription>
            </Alert>

            <Button
              onClick={() => {
                setError(null)
                handleJoinCall()
              }}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 sm:py-3 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg text-sm sm:text-base"
              size="lg"
            >
              <Monitor className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Active Video Call State
  return (
    <div className="w-full h-screen flex flex-col bg-slate-900 relative">
      {error && (
        <Alert className="m-2 sm:m-4 border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-sm sm:text-base">{error}</AlertDescription>
        </Alert>
      )}

      {/* Video Call Container - Fully Responsive */}
      <div className="flex-1 relative bg-slate-900 p-2 sm:p-4 lg:p-6">
        <div
          ref={containerRef}
          className="w-full h-full rounded-lg overflow-hidden shadow-2xl border border-slate-800 bg-slate-800"
          style={{
            minHeight: "300px",
            maxHeight: "calc(100vh - 120px)", // Account for padding and end call button
          }}
        />
      </div>

      {/* Responsive End Call Button */}
      <div className="fixed bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <Button
          onClick={handleEndCall}
          className="bg-red-600 hover:bg-red-700 text-white rounded-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 shadow-lg flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-xl text-sm sm:text-base lg:text-lg font-medium"
          size="lg"
        >
          <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">End Call</span>
          <span className="sm:hidden">End</span>
        </Button>
      </div>
    </div>
  )
}

export default VideoCall
