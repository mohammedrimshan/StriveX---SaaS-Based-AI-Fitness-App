import React from 'react';
import { motion } from 'framer-motion';
import SubscriptionCountdown from '../Trainer/SubScription';

interface BMIGaugeProps {
  bmi: number;
  subscriptionEndDate: string;
}

const BMIGauge: React.FC<BMIGaugeProps> = ({ bmi,subscriptionEndDate }) => {
  // Handle null/undefined BMI values
  const isValidBMI = bmi !== null && bmi !== undefined && !isNaN(bmi);
  const safeBMI = isValidBMI ? bmi : 0;

  const getBMICategory = (bmi: number) => {
    if (!isValidBMI) return { category: 'Enter your details', color: '#9CA3AF', message: 'Fill in height and weight to see your BMI' };
    if (bmi < 18.5) return { category: 'Underweight', color: '#3B82F6', message: 'Consider a balanced diet!' };
    else if (bmi < 25) return { category: 'Normal weight', color: '#22C55E', message: "You're in the Normal range! Keep shining!" };
    else if (bmi < 30) return { category: 'Overweight', color: '#F97316', message: 'Small steps to better health!' };
    else return { category: 'Obesity', color: '#EF4444', message: 'Your health journey starts now!' };
  };

  const { category, color, message } = getBMICategory(safeBMI);
  
  // Calculate progress percentage (BMI 15-40 range mapped to 0-100%)
  const progressPercentage = isValidBMI ? Math.min(Math.max((safeBMI - 15) / 25 * 100, 0), 100) : 0;

  const bmiRanges = [
    { label: 'Underweight', min: 0, max: 14, color: '#3B82F6' },
    { label: 'Normal', min: 14, max: 40, color: '#22C55E' },
    { label: 'Overweight', min: 40, max: 60, color: '#F97316' },
    { label: 'Obesity', min: 60, max: 100, color: '#EF4444' }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
      <h3 className="text-xl font-bold text-gray-800 mb-6">BMI Health Meter</h3>
      
      {/* BMI Value Display */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl font-bold text-gray-800 mb-2"
        >
          {isValidBMI ? safeBMI.toFixed(1) : '--'}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-lg font-semibold mb-2"
          style={{ color }}
        >
          {category}
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-sm text-gray-600 font-medium"
        >
          {message}
        </motion.p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          {/* Background segments */}
          <div className="absolute inset-0 flex">
            {bmiRanges.map((range) => (
              <div
                key={range.label}
                className="h-full opacity-30"
                style={{
                  backgroundColor: range.color,
                  width: `${range.max - range.min}%`
                }}
              />
            ))}
          </div>
          
          {/* Animated progress fill */}
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full shadow-lg"
            style={{ 
              backgroundColor: color,
              boxShadow: `0 0 12px ${color}60`
            }}
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          />
          
          {/* BMI position indicator */}
          {isValidBMI && (
            <motion.div
              className="absolute top-0 w-1 h-full bg-white shadow-md rounded-full"
              style={{ left: `${progressPercentage}%` }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.5 }}
            />
          )}
        </div>
        
        {/* Range labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
          <span>15</span>
          <span>18.5</span>
          <span>25</span>
          <span>30</span>
          <span>40+</span>
        </div>
      </div>

      {/* Category indicators */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          { name: 'Underweight', color: '#3B82F6', range: '<18.5' },
          { name: 'Normal', color: '#22C55E', range: '18.5-25' },
          { name: 'Overweight', color: '#F97316', range: '25-30' },
          { name: 'Obesity', color: '#EF4444', range: '30+' }
        ].map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
            className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 ${
              category.includes(item.name) ? `bg-gray-50 ring-2` : 'hover:bg-gray-50'
            } ${category.includes(item.name) ? `ring-[${item.color}]` : ''}`}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <div>
              <div className="font-medium text-gray-700">{item.name}</div>
              <div className="text-gray-500">{item.range}</div>
            </div>
          </motion.div>
        ))}
      </div>
        <div className="mt-auto">
        <SubscriptionCountdown subscriptionEndDate={subscriptionEndDate} embedded={true} />
      </div>
    </div>
  );
};

export default BMIGauge;