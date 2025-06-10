import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useUpcomingSessions } from "@/hooks/trainer/useTrainerDashboard";
import { AvatarImage } from "@radix-ui/react-avatar";

interface UpcomingSessionsProps {
  trainerId: string;
}

const UpcomingSessions: React.FC<UpcomingSessionsProps> = ({ trainerId }) => {
  const {
    data: sessions,
    isLoading,
    error,
  } = useUpcomingSessions(trainerId, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
      case "booked":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
            Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Unknown
          </Badge>
        );
    }
  };

  if (isLoading) return <div>Loading sessions...</div>;
  if (error) return <div>Error loading sessions: {error.message}</div>;

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Calendar className="w-5 h-5 text-blue-600" />
          Upcoming Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions && sessions.length > 0 ? (
            sessions.map((session, index) => (
              <div
                key={session.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors duration-200 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Avatar className="w-11 h-11">
                  {session.profileImage ? (
                    <AvatarImage
                      src={session.profileImage}
                      alt={session.clientName}
                    />
                  ) : null}

                  <AvatarFallback className="bg-blue-500 text-white font-medium text-sm">
                    {session.clientName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-slate-900 truncate">
                      {session.clientName}
                    </h4>
                    {getStatusBadge(session.status || "pending")}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {session.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {session.startTime} - {session.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {session.location || "TBD"}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 mt-1">
                    {session.workoutType || "Personal Training"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-slate-500">
              No upcoming sessions
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingSessions;
