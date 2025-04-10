import { useState, useEffect } from "react";
import { getPaginatedWorkouts } from "./workoutData";
import { Workout } from "@/types/Workouts";
import WorkoutCard from "./WorkoutCard";
import PaginationControls from "@/components/ui/pagination-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";

const WorkoutsListPage = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with a delay
    setIsLoading(true);
    const timer = setTimeout(() => {
      const data = getPaginatedWorkouts(currentPage, 6);
      setWorkouts(data.items);
      setTotalPages(data.totalPages);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
          <p className="text-muted-foreground">
            Manage your workout programs and exercises
          </p>
        </div>
        <Button asChild className="animate-gradient-shift bg-gradient-to-r from-primary to-purple-600">
          <Link to="/workouts/new">
            <Plus className="mr-2 h-4 w-4" /> Add Workout
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search workouts..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-[360px] rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          {workouts.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="mt-2 text-lg font-semibold">No workouts found</h3>
              <p className="mt-1 text-muted-foreground">
                Try adjusting your search or add a new workout.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {workouts.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default WorkoutsListPage;