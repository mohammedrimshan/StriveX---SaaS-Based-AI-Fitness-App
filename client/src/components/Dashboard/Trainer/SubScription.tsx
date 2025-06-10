import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SubscriptionCountdownProps {
  subscriptionEndDate: string; 
}

const SubscriptionCountdown: React.FC<SubscriptionCountdownProps> = ({ subscriptionEndDate }) => {
  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const end = new Date(subscriptionEndDate).getTime();
    const difference = end - now;

    if (difference <= 0) {
      return null; // expired
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      const updatedTimeLeft = calculateTimeLeft();
      setTimeLeft(updatedTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [subscriptionEndDate]);

  if (!timeLeft) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-red-100 text-red-800 p-4 rounded-lg text-center font-medium"
      >
        Subscription expired
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4">Subscription Countdown</h3>
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Time until subscription ends:</p>
        <div className="flex justify-center space-x-4 text-lg font-semibold text-gray-800">
          <div>
            <span className="block text-2xl text-blue-600">{timeLeft.days}</span>
            <span className="text-xs text-gray-500">Days</span>
          </div>
          <div>
            <span className="block text-2xl text-blue-600">{timeLeft.hours}</span>
            <span className="text-xs text-gray-500">Hours</span>
          </div>
          <div>
            <span className="block text-2xl text-blue-600">{timeLeft.minutes}</span>
            <span className="text-xs text-gray-500">Minutes</span>
          </div>
          <div>
            <span className="block text-2xl text-blue-600">{timeLeft.seconds}</span>
            <span className="text-xs text-gray-500">Seconds</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SubscriptionCountdown;