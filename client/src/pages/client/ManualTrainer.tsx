import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFetchAllTrainers } from "@/hooks/client/useFetchAllTrainers";
import { useManualSelectTrainer } from "@/hooks/client/useManualSelectTrainer";
import { useToaster } from "@/hooks/ui/useToaster";
import { Pagination } from "@/components/common/Pagination/Pagination";
import TrainerCard from "@/pages/client/ManualSelect/TrainerCard";
import { TrainerProfile } from "@/types/trainer";
import { PaginatedTrainersResponse } from "@/types/Response";
import { Loader2 } from "lucide-react";
import AnimatedBackground from "@/components/Animation/AnimatedBackgorund";
import AnimatedTitle from "@/components/Animation/AnimatedTitle";

const ManualTrainersListing = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerProfile | null>(
    null
  );
  const { successToast, errorToast } = useToaster();
  const navigate = useNavigate();
  const { mutate, isPending: isSelecting } = useManualSelectTrainer(); // Use the hook

  const TRAINERS_PER_PAGE = 4;

  // Type assertion to fix the TypeScript error
  const { data, isLoading, isError, error } = useFetchAllTrainers({
    page: currentPage,
    limit: TRAINERS_PER_PAGE,
    search: searchQuery,
  }) as {
    data: PaginatedTrainersResponse | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };

  const handleSelectTrainer = (trainer: TrainerProfile) => {
    setSelectedTrainer(trainer);
    mutate(
      { trainerId: trainer.id },
      {
        onSuccess: (response) => {
          console.log("Raw response:", JSON.stringify(response, null, 2));
          console.log(response, "data response");
          if (response.success) {
            successToast(
              `You've selected ${trainer.firstName} ${trainer.lastName} as your trainer`
            );
          } else {
            errorToast(response.message || "Failed to select trainer");
            setSelectedTrainer(null);
          }
        },
        onError: (err) => {
          console.log(err, "error response");
          errorToast(`${err.response.data.message || "Unknown error"}`);
          setSelectedTrainer(null);
        },
      }
    );
  };

  const handleViewProfile = (trainerId: string) => {
    navigate(`/trainerprofile/${trainerId}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  if (isError) {
    errorToast(`Error loading trainers: ${error?.message || "Unknown error"}`);
  }

  return (
    <AnimatedBackground>
      <div className="container mx-auto px-4 py-12 mt-16">
        <AnimatedTitle
          title="Find Your Perfect Trainer"
          subtitle="Discover expert trainers who will help you reach your fitness goals"
        />

        <form onSubmit={handleSearch} className="max-w-md mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search trainers by name or specialty..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white px-4 py-1 rounded-full hover:bg-purple-700"
            >
              Search
            </button>
          </div>
        </form>

        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
          </div>
        )}

        {!isLoading && data?.trainers.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-xl font-medium mb-2">No trainers found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}

        {!isLoading && data && data.trainers && data.trainers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {data.trainers.map((trainer) => (
              <TrainerCard
                key={trainer.id}
                trainer={trainer as unknown as TrainerProfile}
                onSelect={handleSelectTrainer}
                onViewProfile={handleViewProfile}
                isSelecting={isSelecting}
              />
            ))}
          </div>
        )}

        {data?.totalPages && data.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
            className="mt-8"
          />
        )}

        {selectedTrainer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Trainer Selected!</h3>
              <p className="mb-4">
                You've chosen{" "}
                <span className="font-semibold">
                  {selectedTrainer.firstName} {selectedTrainer.lastName}
                </span>{" "}
                as your trainer.
              </p>
              <p className="mb-6">Would you like to schedule a session now?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setSelectedTrainer(null)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                  disabled={isSelecting}
                >
                  Not now
                </button>
                <button
                  onClick={() => {
                    navigate(`/schedule/${selectedTrainer.id}`); // Redirect to scheduling page
                    setSelectedTrainer(null);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  disabled={isSelecting}
                >
                  {isSelecting ? (
                    <Loader2 className="h-5 w-5 animate-spin inline-block" />
                  ) : (
                    "Schedule Session"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatedBackground>
  );
};

export default ManualTrainersListing;
