import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DollarSign, TrendingUp, CreditCard, Wallet } from 'lucide-react';
import { useEarningsReport } from '@/hooks/trainer/useTrainerDashboard';

interface EarningsReportProps {
  trainerId: string;
  year: number;
  month: number;
}

const EarningsReport: React.FC<EarningsReportProps> = ({ trainerId, year, month }) => {
  const { data: earnings, isLoading, error } = useEarningsReport(trainerId, year, month);

  const chartData = [
    { name: 'Your Earnings', value: earnings?.totalEarnings || 0, color: '#3B82F6' },
    { name: 'Platform Fee', value: earnings?.platformCommission || 0, color: '#E5E7EB' }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-medium text-slate-900">{data.name}</p>
          <p className="text-blue-600 font-semibold">${data.value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) return <div>Loading earnings...</div>;
  if (error) return <div>Error loading earnings: {error.message}</div>;

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          Earnings Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Total Earnings */}
          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg">
            <p className="text-sm font-medium text-slate-600 mb-1">This Month</p>
            <p className="text-3xl font-bold text-slate-900 mb-2">
              ${(earnings?.totalEarnings || 0).toLocaleString()}
            </p>
            <div className="flex items-center justify-center gap-1 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+18% from last month</span>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100">
              <div className="flex items-center gap-3">
                <Wallet className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-slate-900">Your Earnings</span>
              </div>
              <span className="font-bold text-slate-900">${(earnings?.totalEarnings || 0).toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-slate-600" />
                <span className="font-medium text-slate-900">Platform Fee</span>
              </div>
              <span className="font-bold text-slate-900">${(earnings?.platformCommission || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EarningsReport;