import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { useWeeklySessionStats } from '@/hooks/trainer/useTrainerDashboard';
import { useMemo } from 'react';

interface WeeklySessionStatsProps {
  trainerId: string;
  year: number;
  month: number;
}

const WeeklySessionStats: React.FC<WeeklySessionStatsProps> = ({ trainerId, year, month }) => {
  const { data: weeklyStats, isLoading, error } = useWeeklySessionStats(trainerId, year, month);

  const chartData = useMemo(() => {
    if (!weeklyStats) return [];
    const weeks = Array.from(new Set(weeklyStats.map(stat => stat.week)));
    const categories = Array.from(new Set(weeklyStats.map(stat => stat.category)));
    
    return weeks.map(week => {
      const dataPoint: any = { week: `Week ${week}` };
      categories.forEach(category => {
        const stat = weeklyStats.find(s => s.week === week && s.category === category);
        dataPoint[category] = stat?.totalSessions || 0;
      });
      return dataPoint;
    });
  }, [weeklyStats]);

  const colors = {
    Strength: '#3B82F6',
    Cardio: '#10B981',
    Yoga: '#8B5CF6',
    HIIT: '#F59E0B',
    Pilates: '#EF4444',
    // Add more as needed
  };

  if (isLoading) return <div>Loading chart...</div>;
  if (error) return <div>Error loading chart: {error.message}</div>;

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          Weekly Session Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="week" 
                stroke="#64748b"
                fontSize={12}
                fontWeight="500"
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                fontWeight="500"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend />
              {Object.keys(colors).map(category => (
                <Bar 
                  key={category}
                  dataKey={category} 
                  stackId="a" 
                  fill={colors[category as keyof typeof colors]} 
                  radius={[category === Object.keys(colors).slice(-1)[0] ? 2 : 0, category === Object.keys(colors).slice(-1)[0] ? 2 : 0, 0, 0]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklySessionStats;