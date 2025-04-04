// src/pages/client/TrainersPage.tsx
import React, { useState } from 'react';
import { useFetchAllTrainers } from '@/hooks/client/useFetchAllTrainers';
import TrainersList from './TrainerList/TrainersList';
import TrainersPagination from './TrainerList/TrainersPagination';
import TrainersEmptyState from './TrainerList/TrainersEmptyState';
import TrainersLoading from './TrainerList/TrainersLoading';
import { motion } from 'framer-motion';
import { FaDumbbell } from 'react-icons/fa';

const TrainersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState(''); // Kept for future use
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 6;

  const { data, isLoading, isError, error } = useFetchAllTrainers({
    page: currentPage,
    limit,
    search: searchTerm,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalTrainers = data?.totalTrainers || 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 pt-20 pb-8 sm:px-6 lg:px-8 min-h-screen"
    >
      <div className="text-center mb-10">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center items-center gap-2 mb-2"
        >
          <FaDumbbell className="text-blue-600 text-3xl" />
          <h1 className="text-3xl font-bold text-gray-900">Expert Fitness Trainers</h1>
        </motion.div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Find the perfect trainer to help you achieve your fitness goals. Our certified professionals specialize in various fitness disciplines.
        </p>
      </div>

      <div className="pt-8">
        {isLoading ? (
          <TrainersLoading />
        ) : isError ? (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-600">Error loading trainers: {error?.message || 'Unknown error'}</p>
          </div>
        ) : data && totalTrainers > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                Showing {data.trainers.length} of {totalTrainers} trainers
              </p>
            </div>
            <TrainersList trainers={data.trainers} />
            <TrainersPagination
              currentPage={currentPage}
              totalPages={data.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <TrainersEmptyState searchTerm={searchTerm} />
        )}
      </div>
    </motion.div>
  );
};

export default TrainersPage;