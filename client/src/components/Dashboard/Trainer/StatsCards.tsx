import { Card, CardContent } from '@/components/ui/card';
import { Users, Calendar, DollarSign, Star, Clock, TrendingUp } from 'lucide-react';
import { useTrainerDashboardStats } from '@/hooks/trainer/useTrainerDashboard';
import { useMemo } from 'react';

interface StatsCardsProps {
  trainerId: string;
  year: number;
  month: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({ trainerId, year, month }) => {
  const { data: stats, isLoading, error } = useTrainerDashboardStats(trainerId, year, month);
  console.log(stats,"Stats")

  const statsData = useMemo(() => {
    if (!stats) return [];
    return [
      {
        title: 'Active Clients',
        value: stats.totalClients.toString(),
        change: '+3', // This could be calculated from historical data if available
        changeLabel: 'this month',
        changeType: 'positive',
        icon: Users,
        color: 'bg-blue-500'
      },
      {
        title: 'Sessions Completed',
        value: stats.totalSessions.toString(),
        change: '+12', // This could be calculated from historical data
        changeLabel: 'vs last month',
        changeType: 'positive',
        icon: Calendar,
        color: 'bg-emerald-500'
      },
      {
        title: 'Monthly Revenue',
        value: `$${stats.earningsThisMonth.toLocaleString()}`,
        change: '+18%', // This could be calculated from historical data
        changeLabel: 'vs last month',
        changeType: 'positive',
        icon: DollarSign,
        color: 'bg-purple-500'
      },
      {
        title: 'Rating',
        value: stats.averageRating.toFixed(1),
        change: 'TBD', // Could be updated with review count if available
        changeLabel: 'reviews',
        changeType: 'neutral',
        icon: Star,
        color: 'bg-amber-500'
      },
      {
        title: 'Upcoming Sessions',
        value: stats.upcomingSessions.toString(),
        change: stats.upcomingSessions.toString(),
        changeLabel: 'pending',
        changeType: 'neutral',
        icon: Clock,
        color: 'bg-red-500'
      }
    ];
  }, [stats]);

  if (isLoading) return <div>Loading stats...</div>;
  if (error) return <div>Error loading stats: {error.message}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.title}
            className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {stat.changeType === 'positive' && (
                  <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-xs font-medium">{stat.change}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <h3 className="text-sm font-medium text-slate-600">{stat.title}</h3>
                <p className="text-xs text-slate-500">
                  {stat.changeType === 'positive' ? stat.change + ' ' : stat.change + ' '}
                  {stat.changeLabel}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;