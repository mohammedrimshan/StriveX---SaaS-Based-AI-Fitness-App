import React from "react";
import { cn } from "@/lib/utils";
import { Check, Clock, MoreVertical, Calendar, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SlotCardProps } from "@/types/Slot";

export const SlotCard: React.FC<SlotCardProps> = ({
  date,
  startTime,
  endTime,
  isBooked,
  isAvailable,
  clientName,
}) => {
  // Format time for display (HH:MM AM/PM)
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hourNum = parseInt(hours);
    return `${hourNum > 12 ? hourNum - 12 : hourNum}:${minutes} ${
      hourNum >= 12 ? "PM" : "AM"
    }`;
  };

  // Format date for display (Month Day, Year)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className={cn(
        "border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in",
        isBooked
          ? "border-blue-200"
          : isAvailable
          ? "border-green-200"
          : "border-gray-200"
      )}
    >
      <div
        className={cn(
          "py-2 px-4 text-white",
          isBooked
            ? "bg-gradient-to-r from-blue-500 to-indigo-600"
            : isAvailable
            ? "bg-gradient-to-r from-green-500 to-emerald-600"
            : "bg-gradient-to-r from-gray-400 to-gray-500"
        )}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <Calendar size={14} />
            <p className="text-sm font-medium">{formatDate(date)}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/10"
              >
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <Clock size={14} />
          <span className="font-medium">
            {formatTime(startTime)} - {formatTime(endTime)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {isBooked ? (
              <span className="flex items-center text-xs bg-blue-100 text-blue-700 font-medium px-2 py-1 rounded-full">
                <Check size={12} className="mr-1" />
                Booked
              </span>
            ) : isAvailable ? (
              <span className="flex items-center text-xs bg-green-100 text-green-700 font-medium px-2 py-1 rounded-full">
                Available
              </span>
            ) : (
              <span className="flex items-center text-xs bg-gray-100 text-gray-700 font-medium px-2 py-1 rounded-full">
                Unavailable
              </span>
            )}
          </div>

          {clientName && clientName !== "Unknown Client" && isBooked && (
  <div className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
    <UserRound size={12} className="mr-1" />
    <span>Booked By {clientName}</span>
  </div>
)}

        </div>
      </div>
    </div>
  );
};
