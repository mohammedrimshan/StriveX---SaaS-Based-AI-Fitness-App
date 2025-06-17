
import { useState } from "react";
import { CalendarDays, CheckCircle, Clock, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserSubscriptions } from "@/hooks/admin/useUserSubscriptions";

// Define interfaces
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}

interface Subscription {
  clientId: string;
  clientName: string;
  profileImage?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  daysUntilExpiration: number;
  planName?: string;
  status: string;
  isExpired: boolean;
}

interface SubscriptionCardProps {
  subscription: Subscription;
}


function SubscriptionDashboard() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "expired">("all");

  const { data, isLoading, error } = useUserSubscriptions({
    page,
    limit: 10,
    search,
    status,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <p className="text-lg">Loading subscriptions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <p className="text-lg text-rose-500">Error: {error.message}</p>
      </div>
    );
  }

  const subscriptions: Subscription[] = data?.subscriptions ?? [];
  const totalSubscriptions: number = data?.totalSubscriptions ?? 0;
  const totalPages: number = data?.totalPages ?? 1;
  const currentPage: number = data?.currentPage ?? 1;

  // Calculate statistics
  const activeSubscriptions = subscriptions.filter((sub) => !sub.isExpired).length;
  const premiumPlans = subscriptions.filter((sub) => sub.planName === "Premium Plan").length;
  const expiringWithin30Days = subscriptions.filter((sub) => sub.daysUntilExpiration <= 30 && !sub.isExpired).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 mt-12">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Subscription Management</h1>
          <p className="text-muted-foreground">Manage and monitor all your active subscriptions in one place</p>
        </header>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to first page on search
            }}
            className="max-w-sm"
          />
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as "all" | "active" | "expired");
              setPage(1); // Reset to first page on status change
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Subscriptions"
            value={totalSubscriptions}
            icon={<Users className="h-5 w-5 text-emerald-500" />}
            description="All time subscriptions"
          />
          <StatsCard
            title="Active Subscriptions"
            value={activeSubscriptions}
            icon={<CheckCircle className="h-5 w-5 text-emerald-500" />}
            description="Currently active"
          />
          <StatsCard
            title="Premium Plans"
            value={premiumPlans}
            icon={<Badge className="h-5 w-5 text-amber-500" />}
            description="Premium tier subscribers"
          />
          <StatsCard
            title="Expiring Soon"
            value={expiringWithin30Days}
            icon={<Clock className="h-5 w-5 text-rose-500" />}
            description="Within 30 days"
          />
        </div>

        {/* Subscription Cards */}
        <h2 className="text-xl font-semibold mb-4">Active Subscriptions</h2>
        {subscriptions.length === 0 ? (
          <p className="text-muted-foreground">No subscriptions found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((subscription) => (
              <SubscriptionCard key={subscription.clientId} subscription={subscription} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, description }: StatsCardProps) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const {
    clientName,
    profileImage,
    subscriptionStartDate,
    subscriptionEndDate,
    daysUntilExpiration,
    planName,
    status,
  } = subscription;

  // Format dates
  const formatDate = (dateStr: string | undefined): string =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";

  const startDate = formatDate(subscriptionStartDate);
  const endDate = formatDate(subscriptionEndDate);

  // Calculate progress percentage (days elapsed / total days)
  let progressPercentage = 0;
  if (subscriptionStartDate && subscriptionEndDate) {
    const start = new Date(subscriptionStartDate).getTime();
    const end = new Date(subscriptionEndDate).getTime();
    const now = new Date().getTime();
    const totalDays = (end - start) / (1000 * 60 * 60 * 24);
    const daysElapsed = (now - start) / (1000 * 60 * 60 * 24);
    progressPercentage = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);
  }

  // Determine status color
  const getStatusColor = (): string => {
    if (daysUntilExpiration <= 7) return "text-rose-500";
    if (daysUntilExpiration <= 30) return "text-amber-500";
    return "text-emerald-500";
  };

  // Get initials for avatar fallback
  const getInitials = (name: string): string =>
    name
      .split(" ")
      .map((part: string) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={profileImage || "/placeholder.svg"} alt={clientName} />
            <AvatarFallback className="bg-primary/10">{getInitials(clientName)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{clientName}</CardTitle>
            <CardDescription className="text-xs">{planName}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Subscription Period</span>
            </span>
            <Badge variant="outline" className="font-normal">
              {status}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            {startDate} - {endDate}
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span className={getStatusColor()}>{daysUntilExpiration} days remaining</span>
            </div>
            <Progress value={progressPercentage} className="h-1.5" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex justify-between w-full text-xs">
          <span className="text-muted-foreground">{Math.floor(progressPercentage)}% completed</span>
          <span className={`font-medium ${getStatusColor()}`}>
            {daysUntilExpiration <= 30 ? "Renew soon" : "Active"}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}

export default SubscriptionDashboard;
