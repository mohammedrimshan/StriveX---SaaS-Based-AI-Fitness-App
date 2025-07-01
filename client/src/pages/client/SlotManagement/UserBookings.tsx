"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addMinutes, isBefore, isAfter } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, AlertTriangle, X, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToaster } from "@/hooks/ui/useToaster";
import { useCancelBooking } from "@/hooks/slot/useCancelBooking";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import type { ISlot } from "@/types/Slot";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@mui/material";

interface UserBookingsProps {
  bookings: ISlot[];
  onBookingCancelled: () => void;
}

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  trainerName?: string;
  isBooked: boolean;
  videoCallStatus?: string;
  videoCallRoomName?: string;
}

export function UserBookings({
  bookings,
  onBookingCancelled,
}: UserBookingsProps) {
  const { successToast, errorToast } = useToaster();
  const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // Update every 30 seconds for more precise timing

    return () => clearInterval(interval);
  }, []);

  // Process bookings with session dates and statuses
  const processedBookings = useMemo(() => {
    return bookings
      .map((booking) => {
        const [startHour, startMinute] = booking.startTime
          .split(":")
          .map(Number);
        const [year, month, day] = booking.date.split("-").map(Number);

        const sessionDate = new Date(
          year,
          month - 1,
          day,
          startHour,
          startMinute
        );
        const formattedDate = format(sessionDate, "MMMM d, yyyy");
        const cancellationDeadline = addMinutes(currentTime, 30);
        const joinAvailable =
          isAfter(sessionDate, currentTime) &&
          isBefore(sessionDate, addMinutes(currentTime, 10));
        const isPast = isBefore(sessionDate, currentTime);

        let cancelDisabled = false;
        let cancelReason = "";

        if (isBefore(sessionDate, cancellationDeadline)) {
          cancelDisabled = true;
          cancelReason = "Cannot cancel within 30 minutes of session start";
        }

        return {
          ...booking,
          sessionDate,
          formattedDate,
          cancelDisabled,
          cancelReason,
          joinAvailable,
          isPast,
        };
      })
      .sort((a, b) => a.sessionDate.getTime() - b.sessionDate.getTime());
  }, [bookings, currentTime]);

  // Handle cancellation
  const handleCancelBooking = (slotId: string, cancellationReason: string) => {
    if (!cancellationReason.trim()) {
      errorToast("Please provide a cancellation reason");
      return;
    }

    cancelBooking(
      { slotId, cancellationReason },
      {
        onSuccess: () => {
          successToast("Booking cancelled successfully");
          onBookingCancelled();
        },
        onError: (error) => {
          errorToast(error?.message || "Failed to cancel booking");
        },
      }
    );
  };

  // Handle joining session
  const handleJoinSession = (slotId: string) => {
    try {
      window.open(`/session/${slotId}`, "_blank", "noopener,noreferrer");
    } catch (error) {
      errorToast(
        "Failed to open session. Please check your popup blocker settings."
      );
    }
  };

  if (!bookings || bookings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200"
      >
        <p className="text-gray-500">You don't have any upcoming sessions</p>
        <Button variant="outline" className="mt-4">
          Book a Session
        </Button>
      </motion.div>
    );
  }

  // Group sessions by past and upcoming
  const upcomingSessions = processedBookings.filter(
    (booking) => !booking.isPast
  );

  console.log(upcomingSessions, "Upcoming Sessions");
  
  const pastSessions = processedBookings.filter((booking) => booking.isPast);

  return (
    <AnimatePresence>
      <div className="space-y-6">
        {/* Upcoming Sessions */}
        {upcomingSessions.length > 0 && (
          <div>
            <h2 className="text-lg font-medium mb-3 text-gray-800">
              Upcoming Sessions
            </h2>
            <div className="space-y-4">
              {upcomingSessions.map((booking) => (
                <SessionCard
                  key={booking.id}
                  booking={booking}
                  isCancelling={isCancelling}
                  onCancel={handleCancelBooking}
                  onJoin={handleJoinSession}
                />
              ))}
            </div>
          </div>
        )}

        {/* Past Sessions */}
        {pastSessions.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-3 text-gray-700">
              Past Sessions
            </h2>
            <div className="space-y-3 opacity-80">
              {pastSessions.map((booking) => (
                <SessionCard
                  key={booking.id}
                  booking={booking}
                  isCancelling={isCancelling}
                  onCancel={handleCancelBooking}
                  onJoin={handleJoinSession}
                  isPast
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
}

// Extract Session Card as a separate component for cleaner code
interface SessionCardProps {
  booking: any; // Using any here for simplicity, but should use a proper type
  isCancelling: boolean;
  onCancel: (slotId: string, cancellationReason: string) => void;
  onJoin: (slotId: string) => void;
  isPast?: boolean;
}

function SessionCard({
  booking,
  isCancelling,
  onCancel,
  isPast = false,
}: SessionCardProps) {
  const navigate = useNavigate();
  const [cancellationReason, setCancellationReason] = useState("");

  const handleJoinVideoCall = (booking: Booking) => {
    navigate(`/video-call/${booking.id}`);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`p-4 rounded-xl border-2 ${
        isPast ? "border-gray-200 bg-gray-50" : "border-primary/20 bg-primary/5"
      } 
        shadow-sm hover:shadow-md transition-all duration-300`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="mb-3 sm:mb-0">
          <h3 className="font-medium text-gray-800 flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            {booking.formattedDate}
          </h3>
          <div className="flex items-center mt-1 text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-primary/70" />
            <span>
              {booking.startTime} - {booking.endTime}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-700 flex items-center">
            <User className="h-4 w-4 mr-2 text-primary/70" />
            <span className="font-medium">Trainer:</span>{" "}
            {booking.trainerName || "Your Trainer"}
          </div>
        </div>

        {!isPast ? (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <Button
              onClick={() => handleJoinVideoCall(booking)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              <Video className="h-4 w-4 mr-2" />
              Join Video Call
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          disabled={booking.cancelDisabled || isCancelling}
                          className="flex items-center justify-center w-full sm:w-auto"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Cancel your booking?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Please provide a reason for cancelling this session.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="my-4">
                          <Input
                            placeholder="Enter cancellation reason"
                            value={cancellationReason}
                            onChange={(e) =>
                              setCancellationReason(e.target.value)
                            }
                            className="w-full"
                          />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            onClick={() => setCancellationReason("")}
                          >
                            No, keep it
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              onCancel(booking.id, cancellationReason)
                            }
                            className="bg-red-500 hover:bg-red-600"
                            disabled={!cancellationReason.trim()}
                          >
                            Yes, cancel
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TooltipTrigger>
                {booking.cancelDisabled && (
                  <TooltipContent>
                    <p>{booking.cancelReason}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : (
          <Badge variant="outline" className="bg-gray-100">
            Completed
          </Badge>
        )}
      </div>

      {booking.cancelDisabled && !isPast && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 flex items-center text-sm text-amber-600 bg-amber-50 p-2 rounded-lg"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span>{booking.cancelReason}</span>
        </motion.div>
      )}
    </motion.div>
  );
}
