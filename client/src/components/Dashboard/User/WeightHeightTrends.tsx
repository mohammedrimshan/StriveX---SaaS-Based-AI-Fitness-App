import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface WeightHeightTrendsProps {
  weightHistory: Array<{ weight: number; date: string }>;
  heightHistory: Array<{ height: number; date: string }>;
}

const WeightHeightTrends: React.FC<WeightHeightTrendsProps> = ({ weightHistory, heightHistory }) => {
  const weightData = weightHistory.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
    weight: item.weight
  }));

  const heightData = heightHistory.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
    height: item.height
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-800">{label}</p>
          <p className="text-sm text-gray-600">
            {payload[0].dataKey === 'weight' ? `${payload[0].value}kg` : `${payload[0].value}cm`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Body Metrics</h3>
      
      <div className="space-y-6">
        {/* Weight Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Weight Trend</h4>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#6B7280' }}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#F43F5E" 
                  strokeWidth={2}
                  dot={{ fill: '#F43F5E', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 4, stroke: '#F43F5E', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Height Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Height Trend</h4>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={heightData}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#6B7280' }}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="height" 
                  stroke="#14B8A6" 
                  strokeWidth={2}
                  dot={{ fill: '#14B8A6', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 4, stroke: '#14B8A6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center pt-2"
        >
          <p className="text-xs text-gray-500">
            Track your progress over time 📈
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default WeightHeightTrends;