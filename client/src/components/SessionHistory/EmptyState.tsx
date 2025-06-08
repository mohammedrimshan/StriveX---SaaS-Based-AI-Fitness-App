import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

interface EmptyStateProps {
  searchTerm: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ searchTerm }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <User className="h-20 w-20 text-gray-400 mb-6" />
      </motion.div>
      <h3 className="text-xl font-medium text-gray-900 mb-3">
        No sessions found
      </h3>
      <p className="text-gray-600 text-lg">
        {searchTerm ? 'Try adjusting your search terms.' : 'No session history available.'}
      </p>
    </motion.div>
  );
};

export default EmptyState;