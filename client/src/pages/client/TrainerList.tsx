import React, { useState } from 'react';
import { useFetchAllTrainers } from '@/hooks/client/useFetchAllTrainers';
import TrainersList from './TrainerList/TrainersList';
import TrainersPagination from './TrainerList/TrainersPagination';
import TrainersEmptyState from './TrainerList/TrainersEmptyState';
import TrainersLoading from './TrainerList/TrainersLoading';
import AnimatedBackground from '@/components/Animation/AnimatedBackgorund';
import AnimatedTitle from '@/components/Animation/AnimatedTitle';

const TrainersPage: React.FC = () => {
  const [searchTerm, _] = useState(''); // Kept for future use
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
  const totalPages = data?.totalPages || 0;

  return (
    <AnimatedBackground>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <AnimatedTitle
          title="Our Trainers"
          subtitle="Browse our selection of expert fitness trainers and find the perfect match for your fitness journey."
        />

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
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          </>
        ) : (
          <TrainersEmptyState searchTerm={searchTerm} />
        )}
      </div>
    </AnimatedBackground>
  );
};

export default TrainersPage;