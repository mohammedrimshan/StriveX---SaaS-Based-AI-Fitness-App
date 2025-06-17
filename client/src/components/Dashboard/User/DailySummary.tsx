import React, { useState, useEffect } from 'react';
import { Flame, Droplet, Trophy, Target, Calendar, TrendingUp, Sparkles } from 'lucide-react';

interface DailySummaryProps {
  workoutProgress?: any[];
  waterIntake?: number;
}

const DailySummary: React.FC<DailySummaryProps> = ({ 
  workoutProgress = [], 
  waterIntake = 2100 
}) => {
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationStage(prev => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

 const totalCalories = workoutProgress.reduce((sum, workout) => sum + (workout.caloriesBurned || 0), 0);
  const completedWorkouts = workoutProgress.filter(workout => workout.completed).length;

  const stats = [
    {
      icon: <Trophy className="text-yellow-400" size={20} />,
      label: 'Workouts',
      value: completedWorkouts || 0,
      unit: 'completed',
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-500/30',
      target: 5
    },
    {
      icon: <Flame className="text-orange-400" size={20} />,
      label: 'Calories',
      value: totalCalories || 0,
      unit: 'burned',
      color: 'from-orange-400 to-red-500',
      bgColor: 'bg-orange-500/30',
      target: 500
    },
    {
      icon: <Droplet className="text-blue-400" size={20} />,
      label: 'Water',
      value: waterIntake,
      unit: 'ml',
      color: 'from-cyan-400 to-blue-500',
      bgColor: 'bg-blue-500/30',
      target: 3000
    }
  ];

  const achievements = [
    { icon: <Target size={16} />, text: "Daily goal achieved!" },
    { icon: <TrendingUp size={16} />, text: "7-day streak maintained" },
    { icon: <Calendar size={16} />, text: "Perfect week completed" }
  ];

  const getBackgroundClass = () => {
    const backgrounds = [
      'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
      'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900',
      'bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-800',
      'bg-gradient-to-br from-gray-800 via-violet-900 to-gray-800'
    ];
    return backgrounds[animationStage];
  };

  return (
    <div className="relative overflow-hidden transform hover:scale-105 transition-all duration-500 hover:shadow-2xl rounded-3xl">
      {/* Animated background */}
      <div className={`absolute inset-0 ${getBackgroundClass()} transition-all duration-2000`} />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-tl from-blue-500/10 via-transparent to-purple-500/10" />
      
      <div className="relative bg-black/30 backdrop-blur-sm rounded-3xl p-6 text-white shadow-2xl border border-white/20 h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white drop-shadow-lg">
            Daily Summary
          </h3>
          <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50 animate-pulse" />
        </div>
        
        {/* Stats Grid */}
        <div className="space-y-3 mb-5">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="group p-3 rounded-2xl bg-black/40 backdrop-blur-sm border border-white/20 hover:bg-black/50 hover:scale-105 transform transition-all duration-300 cursor-pointer"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-2xl ${stat.bgColor} backdrop-blur-sm group-hover:scale-110 transform transition-all duration-300`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white drop-shadow-sm">
                      {stat.label}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white drop-shadow-lg">
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-200 font-medium drop-shadow-sm">
                    {stat.unit}
                  </div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3 h-2 bg-black/30 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 ease-out`}
                  style={{ 
                    width: `${Math.min((stat.value / stat.target) * 100, 100)}%`,
                    animationDelay: `${index * 300 + 500}ms`
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Achievement badges */}
        <div className="mb-5">
          <h4 className="text-base font-semibold mb-3 text-white drop-shadow-sm">
            Today's Achievements
          </h4>
          <div className="flex flex-wrap gap-2">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium border border-white/30 hover:bg-black/50 hover:scale-105 transform transition-all duration-300 cursor-pointer"
                style={{ animationDelay: `${1200 + index * 200}ms` }}
              >
                <span className="text-yellow-400 drop-shadow-sm">
                  {achievement.icon}
                </span>
                <span className="text-white drop-shadow-sm">{achievement.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational message */}
        <div className="text-center relative">
          <div className="relative bg-black/40 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/30 shadow-lg hover:scale-105 transform transition-all duration-300">
            <p className="text-base font-bold text-white drop-shadow-lg mb-1">
              One step closer to your goals! ✨
            </p>
            <p className="text-xs text-gray-100 drop-shadow-sm">
              Keep up the amazing work!
            </p>
          </div>
        </div>

        {/* Floating animated elements */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" 
             style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-8 right-12 w-1 h-1 bg-pink-400 rounded-full animate-bounce" 
             style={{ animationDelay: '0.5s', animationDuration: '3s' }} />
        <div className="absolute bottom-8 left-8 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" 
             style={{ animationDelay: '1s', animationDuration: '3s' }} />
        
        {/* Sparkle effects */}
        <div className="absolute top-1/4 left-1/4 animate-pulse">
          <Sparkles size={12} className="text-yellow-300/80" />
        </div>
        <div className="absolute bottom-1/4 right-1/4 animate-pulse" 
             style={{ animationDelay: '1s' }}>
          <Sparkles size={10} className="text-pink-300/80" />
        </div>
      </div>
    </div>
  );
};

export default DailySummary;