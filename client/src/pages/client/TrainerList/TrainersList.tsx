// src/components/trainers/TrainersList.tsx
import React from 'react';
import { ITrainer } from '@/types/User';
import TrainerCard from './TrainerCard';
import { motion } from 'framer-motion';

interface TrainersListProps {
  trainers: ITrainer[];
}

const TrainersList: React.FC<TrainersListProps> = ({ trainers }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {trainers.map((trainer, index) => (
        <motion.div
          key={trainer.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <TrainerCard trainer={trainer} />
        </motion.div>
      ))}
    </div>
  );
};

export default TrainersList;