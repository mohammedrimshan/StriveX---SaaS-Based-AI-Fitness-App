import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useUserProgressMetrics } from "@/hooks/progress/useUserProgressMetrics";
import BMIGauge from "@/components/Dashboard/User/BMIGauge";
import WorkoutProgress from "@/components/Dashboard/User/WorkoutProgress";
import WaterIntakeChart from "@/components/Dashboard/User/WaterIntakeChart";
import WeightHeightTrends from "@/components/Dashboard/User/WeightHeightTrends";
import DailySummary from "@/components/Dashboard/User/DailySummary";
import { Loader2 } from "lucide-react";

const UserDashBoard = () => {
  const userId = useSelector((state: RootState) => state.client.client?.id || "");
console.log(userId, "User ID from Redux state");
  const { data, isLoading, isError, error } = useUserProgressMetrics(userId);
console.log(data, "Fetched user progress metrics data");
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex justify-center items-center">
        <Loader2 className="animate-spin text-teal-600" size={48} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto text-center text-red-600">
          Error: {error?.message || "Failed to load dashboard data"}
        </div>
      </div>
    );
  }

  if (!data || data.status !== "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          No progress data available
        </div>
      </div>
    );
  }

  const { bmi, weightHistory, heightHistory, waterIntakeLogs, totalWaterIntake, workoutProgress, videoProgress, workouts , subscriptionEndDate } = data.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8 mt-12">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 via-purple-600 to-coral-500 bg-clip-text text-transparent mb-2">
            Fitness Dashboard
          </h1>
          <p className="text-lg text-gray-600">Track your progress, stay motivated! 💪</p>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* BMI Gauge */}
          <motion.div variants={itemVariants} className="lg:col-span-4">
            <BMIGauge bmi={bmi} subscriptionEndDate={subscriptionEndDate} />
          </motion.div>

          {/* Daily Summary */}
          <motion.div variants={itemVariants} className="lg:col-span-4">
            <DailySummary workoutProgress={workoutProgress} waterIntake={totalWaterIntake} />
          </motion.div>

          {/* Water Intake */}
          <motion.div variants={itemVariants} className="lg:col-span-4">
            <WaterIntakeChart waterLogs={waterIntakeLogs} />
           
          </motion.div>

          {/* Workout Progress */}
          <motion.div variants={itemVariants} className="lg:col-span-8">
            <WorkoutProgress workouts={workouts} workoutProgress={workoutProgress} videoProgress={videoProgress} />
          </motion.div>

          {/* Weight & Height Trends */}
          <motion.div variants={itemVariants} className="lg:col-span-4">
            <WeightHeightTrends weightHistory={weightHistory} heightHistory={heightHistory} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserDashBoard;