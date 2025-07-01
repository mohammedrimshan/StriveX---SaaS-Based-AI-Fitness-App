import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, 
  Video, 
  XCircle, 
  User, 
  Clock, 
  Play,
  Users,
  Calendar,
  Timer,
  Heart,
  Star,
  Zap
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCancelTrainerSlot } from "@/hooks/slot/useCancelTrainerSlot";
import AnimatedBackground from "@/components/Animation/AnimatedBackgorund";
import AnimatedTitle from "@/components/Animation/AnimatedTitle";
import { useNavigate } from "react-router-dom";

export interface Client {
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}

export interface Slot {
  id: string;
  trainerId: string;
  trainerName?: string;
  clientId?: string;
  clientName?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "booked" | "cancelled";
  isBooked: boolean;
  isAvailable: boolean;
  videoCallStatus?: string;
  videoCallRoomName?: string;
  client?: Client;
  cancellationReason?: string;
  cancellationReasons?: string[];
}

interface TrainerSlotsProps {
  slots: Slot[];
}

export const TrainerSlots = ({ slots }: TrainerSlotsProps) => {
  const bookedSlots = slots.filter((slot: Slot) => slot.isBooked && slot.status === "booked");
  const cancelledSlots = slots.filter((slot: Slot) => slot.status === "cancelled" || slot.cancellationReason);
  console.log("Booked slots:", bookedSlots); // Debugging
  console.log("Cancelled slots:", cancelledSlots); // Debugging
  const [activeTab, setActiveTab] = useState("booked");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const navigate = useNavigate();
  const cancelMutation = useCancelTrainerSlot();

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleStartVideoCall = (slot: Slot): void => {
    navigate(`/trainer/video-call/${slot.id}`);
  };

  const handleOpenCancelModal = (slot: Slot): void => {
    setSelectedSlot(slot);
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = (): void => {
    setIsCancelModalOpen(false);
    setSelectedSlot(null);
    setCancellationReason("");
  };

  const handleCancelSession = async (): Promise<void> => {
    if (selectedSlot && cancellationReason.trim()) {
      try {
        await cancelMutation.mutateAsync({
          slotId: selectedSlot.id,
          cancellationReason,
        });
        handleCloseCancelModal();
      } catch (error) {
        // Error handling is managed by the useCancelTrainerSlot hook
      }
    }
  };

  const getStatusBadge = (slot: Slot) => {
    if (slot.status === "booked") {
      return (
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative"
        >
          <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 shadow-lg">
            <Heart className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </motion.div>
      );
    } else if (slot.status === "cancelled") {
      return (
        <Badge variant="destructive" className="shadow-lg">
          <XCircle className="w-3 h-3 mr-1" />
          Cancelled
        </Badge>
      );
    }
    return null;
  };

  const getVideoCallStatusBadge = (status?: string) => {
    if (!status) return null;
    
    switch (status) {
      case "not_started":
        return (
          <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
            <Timer className="w-3 h-3 mr-1" />
            Ready
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white animate-pulse">
            <Zap className="w-3 h-3 mr-1" />
            Live
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <Star className="w-3 h-3 mr-1" />
            Done
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    hover: { 
      y: -8, 
      scale: 1.02,
      transition: { duration: 0.2, ease: "easeOut" }
    }
  };

  return (
    <AnimatedBackground>
      <div className="container px-4 py-8 mx-auto max-w-7xl mt-10">
        <AnimatedTitle 
          title="Training Sessions"
          subtitle="Manage your booked and cancelled training sessions with style and efficiency"
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Tabs
            defaultValue="booked"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex justify-center mb-10">
              <TabsList className="grid grid-cols-2 w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-full p-1">
                <TabsTrigger
                  value="booked"
                  className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Active ({bookedSlots.length})
                </TabsTrigger>
                <TabsTrigger
                  value="cancelled"
                  className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancelled ({cancelledSlots.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <TabsContent value="booked" className="space-y-8">
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {bookedSlots.length > 0 ? (
                    bookedSlots.map((slot: Slot, index: number) => (
                      <motion.div
                        key={slot.id}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="h-full overflow-hidden border-0 shadow-xl bg-white/90 backdrop-blur-sm border-l-4 border-l-gradient-to-b from-blue-500 to-purple-600 relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group hover:opacity-100 transition-opacity duration-300" />
                          
                          <CardContent className="pt-6 relative z-10">
                            <div className="flex items-start justify-between mb-6">
                              <div className="flex items-center">
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  className="relative"
                                >
                                  <Avatar className="h-14 w-14 mr-4 border-3 border-gradient-to-r from-blue-400 to-purple-400 shadow-lg">
                                    {slot.client?.profileImage ? (
                                      <AvatarImage src={slot.client.profileImage} alt={`${slot.client.firstName} ${slot.client.lastName}`} />
                                    ) : (
                                      <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-bold text-lg">
                                        {slot.client
                                          ? getInitials(slot.client.firstName, slot.client.lastName)
                                          : "NA"}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                </motion.div>
                                <div>
                                  <h3 className="font-bold text-lg text-gray-800">
                                    {slot.client 
                                      ? `${slot.client.firstName} ${slot.client.lastName}` 
                                      : slot.clientName || "Unknown Client"}
                                  </h3>
                                  <p className="text-sm text-gray-500 font-medium">{slot.client?.email || "No email provided"}</p>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 items-end">
                                {getStatusBadge(slot)}
                                {getVideoCallStatusBadge(slot.videoCallStatus)}
                              </div>
                            </div>

                            <div className="space-y-4 mb-6">
                              <motion.div 
                                className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
                                whileHover={{ scale: 1.02 }}
                              >
                                <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                                <span className="text-gray-700 font-medium">{formatDate(slot.date)}</span>
                              </motion.div>
                              
                              <motion.div 
                                className="flex items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg"
                                whileHover={{ scale: 1.02 }}
                              >
                                <Clock className="h-5 w-5 mr-3 text-purple-600" />
                                <span className=" text-gray-700 font-medium">{slot.startTime} - {slot.endTime}</span>
                              </motion.div>
                              
                              {slot.trainerName && (
                                <motion.div 
                                  className="flex items-center p-3 bg-gradient-to-r from-pink-50 to-red-50 rounded-lg"
                                  whileHover={{ scale: 1.02 }}
                                >
                                  <User className="h-5 w-5 mr-3 text-pink-600" />
                                  <span className="text-gray-700 font-medium">Trainer: {slot.trainerName}</span>
                                </motion.div>
                              )}
                            </div>

                            <div className="space-y-3">
                              {slot.videoCallStatus === "not_started" && (
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Button
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg border-0 group relative overflow-hidden"
                                    onClick={() => handleStartVideoCall(slot)}
                                  >
                                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                    <Play className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                                    Start Video Session
                                  </Button>
                                </motion.div>
                              )}

                              {(!slot.videoCallStatus || slot.videoCallStatus === "not_started") && (
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Button
                                    className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg border-0 group relative overflow-hidden"
                                    onClick={() => handleOpenCancelModal(slot)}
                                    disabled={cancelMutation.isPending}
                                  >
                                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                    <XCircle className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                                    Cancel Session
                                  </Button>
                                </motion.div>
                              )}
                            </div>

                            {slot.videoCallRoomName && (
                              <motion.div 
                                className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                <div className="flex items-center">
                                  <Video className="h-4 w-4 mr-2 text-blue-600" />
                                  <span className="text-gray-600 text-sm font-medium">Room:</span>
                                  <span className="text-gray-800 ml-2 font-mono text-sm bg-white px-2 py-1 rounded border">{slot.videoCallRoomName}</span>
                                </div>
                              </motion.div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div 
                      className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <CalendarDays className="h-20 w-20 mb-6 text-blue-300" />
                      </motion.div>
                      <p className="text-2xl font-medium">No active sessions found</p>
                      <p className="text-gray-400 mt-2">Your booked sessions will appear here</p>
                    </motion.div>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="cancelled" className="space-y-8">
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {cancelledSlots.length > 0 ? (
                    cancelledSlots.map((slot: Slot, index: number) => (
                      <motion.div
                        key={slot.id}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="h-full overflow-hidden border-0 shadow-xl bg-white/90 backdrop-blur-sm border-l-4 border-l-red-500 relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          <CardContent className="pt-6 relative z-10">
                            <div className="flex items-start justify-between mb-6">
                              <div className="flex items-center">
                                <Avatar className="h-14 w-14 mr-4 border-3 border-red-200 shadow-lg grayscale">
                                  {slot.client?.profileImage ? (
                                    <AvatarImage src={slot.client.profileImage} alt={`${slot.client.firstName} ${slot.client.lastName}`} />
                                  ) : (
                                    <AvatarFallback className="bg-red-100 text-red-600 font-bold text-lg">
                                      {slot.client
                                        ? getInitials(slot.client.firstName, slot.client.lastName)
                                        : "NA"}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div>
                                  <h3 className="font-bold text-lg text-gray-800">
                                    {slot.client 
                                      ? `${slot.client.firstName} ${slot.client.lastName}` 
                                      : slot.clientName || "Unknown Client"}
                                  </h3>
                                  <p className="text-sm text-gray-500 font-medium">{slot.client?.email || "No email provided"}</p>
                                </div>
                              </div>
                              <Badge variant="destructive" className="shadow-lg">
                                <XCircle className="w-3 h-3 mr-1" />
                                Cancelled
                              </Badge>
                            </div>

                            <div className="space-y-4 mb-6">
                              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                                <span className="text-gray-600 font-medium">{formatDate(slot.date)}</span>
                              </div>
                              
                              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <Clock className="h-5 w-5 mr-3 text-gray-400" />
                                <span className="text-gray-600 font-medium">{slot.startTime} - {slot.endTime}</span>
                              </div>
                              
                              {slot.trainerName && (
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                  <User className="h-5 w-5 mr-3 text-gray-400" />
                                  <span className="text-gray-600 font-medium">Trainer: {slot.trainerName}</span>
                                </div>
                              )}
                            </div>

                            <motion.div 
                              className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg border border-red-100"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              <div className="flex items-start mb-3">
                                <XCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                                <h4 className="font-semibold text-red-700 text-lg">Cancellation Reason</h4>
                              </div>
                              <div className="pl-8">
                                {slot.cancellationReasons && slot.cancellationReasons.length > 0 ? (
                                  slot.cancellationReasons.map((reason: string, idx: number) => (
                                    <motion.div
                                      key={idx}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.3 + idx * 0.1 }}
                                      className="flex items-center text-gray-700 mb-2 last:mb-0"
                                    >
                                      <div className="w-2 h-2 bg-red-400 rounded-full mr-3 flex-shrink-0" />
                                      <span className="text-sm font-medium">{reason}</span>
                                    </motion.div>
                                  ))
                                ) : (
                                  <div className="flex items-center text-gray-700">
                                    <div className="w-2 h-2 bg-red-400 rounded-full mr-3 flex-shrink-0" />
                                    <span className="text-sm font-medium">{slot.cancellationReason || "No reason provided"}</span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div 
                      className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <XCircle className="h-20 w-20 mb-6 text-red-300" />
                      </motion.div>
                      <p className="text-2xl font-medium">No cancelled sessions</p>
                      <p className="text-gray-400 mt-2">Cancelled sessions will appear here</p>
                    </motion.div>
                  )}
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>

          <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
            <DialogContent className="bg-white/90 backdrop-blur-sm rounded-xl border-0 shadow-xl max-w-md">
              <DialogHeader>
                <DialogTitle className="text-red-600">Confirm Cancellation</DialogTitle>
                <DialogDescription className="text-gray-500">
                  Are you sure you want to cancel this training session? This action cannot be undone. Please provide a reason for cancellation.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="cancellationReason" className="text-gray-700 font-medium">
                  Cancellation Reason
                </Label>
                <Input
                  id="cancellationReason"
                  className="mt-1 w-full"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Enter reason for cancellation..."
                  required
                />
              </div>
              <DialogFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleCloseCancelModal}
                  className="mt-2 sm:mt-0 w-full sm:w-auto border-gray-200 hover:bg-gray-100"
                >
                  Back
                </Button>
                <Button
                  className="mt-2 sm:mt-0 w-full sm:w-auto bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg"
                  onClick={handleCancelSession}
                  disabled={cancelMutation.isPending || !cancellationReason.trim()}
                >
                  {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </AnimatedBackground>
  );
};