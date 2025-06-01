import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Droplet } from 'lucide-react';

interface WaterIntakeChartProps {
  waterLogs: Array<{
    actual: number;
    target: number;
    date: string;
  }>;
}

const WaterIntakeChart: React.FC<WaterIntakeChartProps> = ({ waterLogs }) => {
  const chartData = waterLogs.map(log => ({
    date: new Date(log.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
    actual: log.actual,
    target: log.target,
    percentage: (log.actual / log.target) * 100
  }));

  const totalIntake = waterLogs.reduce((sum, log) => sum + log.actual, 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Water Intake</h3>
        <div className="flex items-center space-x-2">
          <Droplet className="text-teal-500" size={20} />
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-sm font-semibold text-teal-600"
          >
            {totalIntake}ml total
          </motion.span>
        </div>
      </div>

      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis hide />
            <Bar dataKey="actual" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.actual >= entry.target ? '#14B8A6' : '#94A3B8'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-2"
      >
        <p className="text-sm font-medium text-gray-700">
          Stay hydrated, you're killing it! 💧
        </p>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Target: 3000ml/day</span>
          <span className="text-teal-600 font-semibold">
            {chartData.filter(d => d.actual >= d.target).length}/5 days met
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default WaterIntakeChart;