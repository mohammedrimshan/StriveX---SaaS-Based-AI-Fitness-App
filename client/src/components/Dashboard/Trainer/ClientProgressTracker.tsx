import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  AlertTriangle,
} from "lucide-react";
import { useClientProgress } from "@/hooks/trainer/useTrainerDashboard";
import { AvatarImage } from "@radix-ui/react-avatar";

interface ClientProgressTrackerProps {
  trainerId: string;
}

const ClientProgressTracker: React.FC<ClientProgressTrackerProps> = ({
  trainerId,
}) => {
  const { data: clients, isLoading, error } = useClientProgress(trainerId, 3);

  const ClientItem = ({ client, index }: { client: any; index: number }) => (
    <div
      className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors duration-200 animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <Avatar className="w-10 h-10">
        {client.profileImage ? (
          <AvatarImage src={client.profileImage} alt={client.clientName} />
        ) : null}

        <AvatarFallback className="bg-blue-500 text-white font-medium text-sm">
          {client.clientName
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-slate-900 text-sm truncate">
          {client.clientName}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-600">
            {Math.round(client.consistency * 100)}% consistency
          </span>
          {client.consistency > 0.8 && (
            <Badge className="text-xs bg-emerald-100 text-emerald-700 border-0">
              Consistent
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center">
        {client.type === "most" ? (
          <TrendingUp className="w-4 h-4 text-emerald-600" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500" />
        )}
      </div>
    </div>
  );

  if (isLoading) return <div>Loading client progress...</div>;
  if (error) return <div>Error loading client progress: {error.message}</div>;

  const topClients = clients?.filter((c) => c.type === "most") || [];
  const strugglingClients = clients?.filter((c) => c.type === "least") || [];

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Target className="w-5 h-5 text-orange-600" />
          Client Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Top Performers */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-emerald-600" />
              <h3 className="font-medium text-slate-900 text-sm">
                Top Performers
              </h3>
            </div>
            <div className="space-y-2">
              {topClients.length > 0 ? (
                topClients.map((client, index) => (
                  <ClientItem
                    key={client.clientId}
                    client={client}
                    index={index}
                  />
                ))
              ) : (
                <div className="text-center py-4 text-slate-500">
                  No top performers
                </div>
              )}
            </div>
          </div>

          {/* Need Attention */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="font-medium text-slate-900 text-sm">
                Needs Attention
              </h3>
            </div>
            <div className="space-y-2">
              {strugglingClients.length > 0 ? (
                strugglingClients.map((client, index) => (
                  <ClientItem
                    key={client.clientId}
                    client={client}
                    index={index + 3}
                  />
                ))
              ) : (
                <div className="text-center py-4 text-slate-500">
                  No clients need attention
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientProgressTracker;
