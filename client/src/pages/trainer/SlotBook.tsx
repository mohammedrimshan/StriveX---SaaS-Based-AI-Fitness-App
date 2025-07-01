import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Slot } from "./ListBookedSlot/SlotCard";
import { TrainerSlots } from "./ListBookedSlot/SlotCard";
import { useTrainerBookedAndCancelledSlots } from "@/hooks/slot/useTrainerBookedAndCancelledSlots";
import { SlotsResponse } from "@/types/Slot";
import { CalendarDays, XCircle } from "lucide-react";
import { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";

const Bookslots: React.FC = () => {
  const trainerId = useSelector((state: RootState) => state.trainer.trainer?.id);
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, error, isFetching } = useTrainerBookedAndCancelledSlots({
    trainerId: trainerId || "",
    page,
    limit,
  });

  const transformSlots = (response: SlotsResponse | undefined): Slot[] => {
    if (!response?.slots) return [];

    return response.slots.map((slot) => ({
      
      id: slot.id,
      trainerId: slot.trainerId,
      clientId: slot.clientId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status.toLowerCase() as "booked" | "cancelled",
      isBooked: slot.isBooked,
      isAvailable: slot.isAvailable,
      videoCallStatus: slot.videoCallStatus,
      trainerName: slot.trainerName,
      clientName: slot.clientName,
      videoCallRoomName: slot.videoCallRoomName,
      client: slot.client
        ? {
            clientId: slot.client.clientId,
            firstName: slot.client.firstName || "", 
            lastName: slot.client.lastName || "",   
            email: slot.client.email || "",        
            profileImage: slot.client.profileImage || "",
          }
        : undefined,
      cancellationReason: slot.cancellationReason,
      cancellationReasons: slot.cancellationReason ? [slot.cancellationReason] : [],
    }));
    
  };



  const slots = transformSlots(data as SlotsResponse | undefined);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  if (!trainerId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center text-red-500">
        <XCircle className="h-16 w-16 mb-4 opacity-30" />
        <p className="text-xl">Please log in to view slots</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {isLoading && !slots.length ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <CalendarDays className="h-16 w-16 mb-4 animate-spin opacity-30" />
          <p className="text-xl">Loading slots...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-12 text-red-500">
          <XCircle className="h-16 w-16 mb-4 opacity-30" />
          <p className="text-xl">Error: {error?.message || "Failed to fetch slots"}</p>
        </div>
      ) : (
        <>
          <TrainerSlots slots={slots} />
          {(data as SlotsResponse)?.slots?.length === limit && (
            <div className="flex justify-center py-4">
              <Button
                onClick={handleLoadMore}
                disabled={isFetching}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isFetching ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Bookslots;