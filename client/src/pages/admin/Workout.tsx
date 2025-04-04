import React from "react";
import WorkoutForm from "./WorkoutAdd/WorkoutForm";
import { motion } from "framer-motion";

const AdminWorkoutsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 py-12 px-4">
      <div className="container mx-auto">
        <motion.div 
          className="flex justify-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
        
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <WorkoutForm />
        </motion.div>
      </div>
    </div>
  );
};

export default AdminWorkoutsPage;
