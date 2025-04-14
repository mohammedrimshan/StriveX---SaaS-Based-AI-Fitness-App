import { useState, useEffect, useCallback } from "react";
import { useAllWorkouts } from "@/hooks/admin/useFetchAllWorkouts";
import { Workout } from "@/types/Workouts";
import WorkoutCard from "./WorkoutCard";
import PaginationControls from "@/components/ui/pagination-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedBackground from "@/components/Animation/AnimatedBackgorund";
import AnimatedTitle from "@/components/Animation/AnimatedTitle";
import debounce from "lodash/debounce";

const WorkoutsListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const limit = 6;

  // Create a debounced search function
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
      // Reset to first page when search term changes
      setCurrentPage(1);
    }, 500),
    []
  );

  // Update the search term and trigger the debounced search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Clear search field
  const clearSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const { data, isLoading, error } = useAllWorkouts(currentPage, limit, {
    title: { $regex: debouncedSearchTerm, $options: "i" },
  });

  const workouts = data?.data.data || [];
  const totalPages = data?.data.totalPages || 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatedBackground>
      <div className="container mx-auto px-4 py-6 mt-16">
        <div className="mb-8">
          <AnimatedTitle 
            title="Workouts" 
            subtitle="Manage your workout programs and exercises" 
          />
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <div className="group relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-indigo-500" />
              </div>
              <Input
                type="search"
                placeholder="Search workouts..."
                className="w-full pl-10 pr-10 py-3 border-2 border-indigo-100 focus:border-indigo-300 rounded-lg shadow-sm transition-all duration-300 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 bg-white/80 backdrop-blur-sm"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button 
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-indigo-500"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            {isLoading && debouncedSearchTerm && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2">
                <div className="h-5 w-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <Button asChild className="animate-gradient-shift bg-gradient-to-r from-primary to-purple-600 shadow-md hover:shadow-lg transition-all duration-300 text-white font-medium px-6 py-2.5">
            <Link to="/admin/workout" className="flex items-center">
              <Plus className="mr-2 h-5 w-5" /> 
              <span>Add Workout</span>
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[360px] rounded-lg bg-indigo-50 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-red-500">Error loading workouts</h3>
            <p className="mt-2 text-gray-600">{error.message}</p>
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-lg shadow-md">
            <h3 className="mt-2 text-lg font-semibold">No workouts found</h3>
            <p className="mt-1 text-gray-600">
              Try adjusting your search or add a new workout.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {workouts.map((workout) => (
                <WorkoutCard 
                  key={workout._id} 
                  workout={workout as Workout} 
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </AnimatedBackground>
  );
};

export default WorkoutsListPage;