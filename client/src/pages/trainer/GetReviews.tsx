import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, StarHalf, User, Calendar, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import AnimatedTitle from "@/components/Animation/AnimatedTitle";
import EmptyStateAnimation from "@/components/Animation/EmptyStateAnimation";
import AnimatedBackground from "@/components/Animation/AnimatedBackgorund";
import { fetchTrainerReviews } from "@/services/trainer/trainerService";
import { Review } from "@/types/trainer";

const useFetchTrainerReviews = (trainerId: string, skip: number = 0, limit: number = 10) => {
  const [data, setData] = useState<{ items: Review[]; total: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchTrainerReviews(trainerId, skip, limit);
        setData(response);
        setIsError(false);
        setError(null);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setIsError(true);
        setError(err instanceof Error ? err : new Error("Failed to fetch reviews"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [trainerId, skip, limit]);

  return { data, isLoading, isError, error };
};

// StarRating component
const StarRating = ({ rating, size = "w-4 h-4" }: { rating: number; size?: string }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className={`${size} fill-yellow-400 text-yellow-400`} />
      ))}
      {hasHalfStar && <StarHalf className={`${size} fill-yellow-400 text-yellow-400`} />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className={`${size} text-gray-300`} />
      ))}
      <span className="ml-1 text-xs font-medium text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
};

const ReviewCard = ({ review, index, isLatest = false }: { review: Review; index: number; isLatest?: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongComment = review.comment && review.comment.length > 150;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 border ${
        isLatest ? "border-indigo-200 bg-gradient-to-r from-indigo-50/80 to-purple-50/80" : "border-gray-200"
      }`}
    >
      {isLatest && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white mb-2"
        >
          ✨ Latest Review
        </motion.div>
      )}

      <div className="flex items-start gap-3">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          {review.clientProfileImage ? (
            <img
              src={review.clientProfileImage}
              alt={review.clientName}
              className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Review Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{review.clientName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={review.rating} />
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(review.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {review.comment && (
            <div className="space-y-2">
              <div className="flex items-start gap-1.5">
                <MessageCircle className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <motion.p
                    className="text-gray-700 text-sm leading-relaxed"
                    initial={false}
                    animate={{ height: isExpanded ? "auto" : "auto" }}
                  >
                    {isLongComment && !isExpanded ? `${review.comment.substring(0, 150)}...` : review.comment}
                  </motion.p>
                  {isLongComment && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="mt-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          Show Less <ChevronUp className="w-3 h-3" />
                        </>
                      ) : (
                        <>
                          Read More <ChevronDown className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Main TrainerReviews component
interface TrainerReviewsProps {
  trainerId: string;
}

const TrainerReviews: React.FC<TrainerReviewsProps> = ({ trainerId }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  const { data, isLoading, isError, error } = useFetchTrainerReviews(trainerId, currentPage * itemsPerPage, itemsPerPage);

  const reviews = data?.items || [];
  const totalReviews = data?.total || 0;
  const totalPages = Math.ceil(totalReviews / itemsPerPage);

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  if (isLoading) {
    return (
      <AnimatedBackground>
        <div className="min-h-screen flex items-center justify-center ">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
          />
        </div>
      </AnimatedBackground>
    );
  }

  if (isError) {
    return (
      <AnimatedBackground>
        <div className="min-h-screen flex items-center justify-center p-4 ">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Reviews</h2>
            <p className="text-gray-600">{error?.message || "Something went wrong"}</p>
          </div>
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 mt-9">
        <div className="max-w-4xl mx-auto">
          <AnimatedTitle
            title="Client Reviews"
            subtitle={`See what clients are saying about your training services`}
          />

          {/* Reviews Statistics */}
          {reviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8 border border-gray-200"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Summary</h3>
                  <div className="flex items-center gap-4">
                    <StarRating rating={averageRating} size="w-6 h-6" />
                    <span className="text-sm text-gray-600">
                      Based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">Average Rating</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <EmptyStateAnimation
              message="No reviews yet"
              subMessage="Client reviews will appear here once you start receiving feedback"
            />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {reviews.map((review, index) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    index={index}
                    isLatest={currentPage === 0 && index === 0}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center items-center gap-4 mt-12"
            >
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 rounded-lg bg-white/80 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                      currentPage === i
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                        : "bg-white/80 border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-4 py-2 rounded-lg bg-white/80 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default TrainerReviews;