// src/components/trainers/TrainersEmptyState.tsx
import React from 'react';
import { FaSearch, FaUserSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface TrainersEmptyStateProps {
  searchTerm?: string;
}

const TrainersEmptyState: React.FC<TrainersEmptyStateProps> = ({ searchTerm }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-12 px-4 mt-8 bg-gray-50 rounded-lg border border-gray-200"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="rounded-full bg-gray-100 p-6 text-gray-400"
      >
        {searchTerm ? (
          <FaSearch className="w-10 h-10" />
        ) : (
          <FaUserSlash className="w-10 h-10" />
        )}
      </motion.div>
      
      <h3 className="mt-4 text-xl font-medium text-gray-900">
        {searchTerm 
          ? 'No trainers found' 
          : 'No trainers available'
        }
      </h3>
      
      <p className="mt-2 text-center text-gray-500 max-w-md">
        {searchTerm 
          ? `We couldn't find any trainers matching "${searchTerm}". Try adjusting your search terms or filters.` 
          : 'There are currently no trainers available. Please check back later or try adjusting your filters.'
        }
      </p>
      
      {searchTerm && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Clear search
        </motion.button>
      )}
    </motion.div>
  );
};

export default TrainersEmptyState;