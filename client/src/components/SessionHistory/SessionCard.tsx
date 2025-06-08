"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UserCheck,
  User,
  Calendar,
  Clock,
  Video,
  History,
  CheckCircle,
  XCircle,
  BookOpen,
  Play,
  Square,
  VideoOff,
  Pause,
} from "lucide-react";
import { SessionItem } from "@/types/Session";
import { UserRole } from "@/types/UserRole";
import { formatDate, formatTime, formatBookedAt, getStatusVariant } from "@/utils/sessionUtil";

interface SessionCardProps {
  item: SessionItem;
  index: number;
  role: UserRole;
}

const SessionCard: React.FC<SessionCardProps> = ({ item, index, role }) => {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "booked":
        return <BookOpen className="h-3 w-3" />;
      case "cancelled":
        return <XCircle className="h-3 w-3" />;
      case "completed":
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getCallStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "started":
        return <Play className="h-3 w-3 text-green-600" />;
      case "ended":
        return <Square className="h-3 w-3 text-gray-600" />;
      case "not started":
        return <VideoOff className="h-3 w-3 text-red-600" />;
      default:
        return <Pause className="h-3 w-3 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "from-green-500 to-emerald-600";
      case "cancelled":
        return "from-red-500 to-rose-600";
      case "booked":
        return "from-blue-500 to-indigo-600";
      default:
        return "from-gray-500 to-slate-600";
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden">
      <CardHeader className={`pb-2 bg-gradient-to-r ${getStatusColor(item.status)} text-white relative`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs px-2 py-0.5">
              #{index + 1}
            </Badge>
            <div className="flex items-center gap-1">
              {getStatusIcon(item.status)}
              <span className="text-xs font-medium capitalize">{item.status}</span>
            </div>
          </div>

          <div className="space-y-1">
            {role !== "trainer" && (
              <div className="flex items-center gap-2">
                <UserCheck className="h-3 w-3" />
                <span className="font-semibold text-sm truncate">{item.trainerName}</span>
              </div>
            )}
            {role !== "client" && (
              <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                <span className="text-white/90 text-xs truncate">{item.clientName}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <Calendar className="h-3 w-3 text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-gray-600 text-[10px]">Date</p>
              <p className="font-medium text-gray-900 truncate">{formatDate(item.date)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <Clock className="h-3 w-3 text-orange-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-gray-600 text-[10px]">Time</p>
              <p className="font-medium text-gray-900 truncate">
                {formatTime(item.startTime)} - {formatTime(item.endTime)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <Video className="h-3 w-3 text-purple-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-gray-600 text-[10px]">Call</p>
              <div className="flex items-center gap-1">
                {getCallStatusIcon(item.videoCallStatus)}
                <span className="font-medium text-gray-900 capitalize truncate text-[10px]">
                  {item.videoCallStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <History className="h-3 w-3 text-indigo-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-gray-600 text-[10px]">Booked</p>
              <p className="font-medium text-gray-900 truncate">{formatBookedAt(item.bookedAt)}</p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <Badge
            variant={getStatusVariant(item.status)}
            className={`w-full justify-center py-1 text-xs font-medium ${
              item.status === "completed"
                ? "bg-green-100 text-green-800 border-green-200"
                : item.status === "cancelled"
                ? "bg-red-100 text-red-800 border-red-200"
                : "bg-blue-100 text-blue-800 border-blue-200"
            }`}
          >
            {getStatusIcon(item.status)}
            <span className="ml-1 capitalize">{item.status}</span>
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionCard;