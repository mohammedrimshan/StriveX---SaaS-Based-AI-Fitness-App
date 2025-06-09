import React, { useState } from "react";
import {
  FaStar,
  FaCalendarAlt,
  FaChartLine,
  FaTrophy,
  FaCheckCircle,
  FaUsers,
  FaEdit,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TrainerProfileType } from "@/types/trainer";
import { useSubmitReview, useUpdateReview } from "@/hooks/review/useReviewHook";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useFetchTrainerReviews } from "@/hooks/review/useReviewHook";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

interface TrainerProfileViewProps {
  trainer: TrainerProfileType | null;
  loading: boolean;
  error: string | null;
}

const TrainerProfile: React.FC<TrainerProfileViewProps> = ({
  trainer,
  loading,
  error,
}) => {
  const navigate = useNavigate();
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [isEditReviewModalOpen, setIsEditReviewModalOpen] = useState(false);
  const [editReviewId, setEditReviewId] = useState<string | null>(null);
  const client = useSelector((state: RootState) => state.client.client);
  const clientId = client?.id;
  const submitReviewMutation = useSubmitReview();
  const updateReviewMutation = useUpdateReview();

  const clientReview = trainer?.reviews.items.find(
    (review) => review.clientId === clientId
  );

  const handleSubmitReview = () => {
    if (!trainer || !clientId) return;
    submitReviewMutation.mutate(
      {
        clientId,
        trainerId: trainer.trainer.id,
        rating: newRating,
        comment: newReview,
      },
      {
        onSuccess: () => {
          setNewReview("");
          setNewRating(0);
          setHoveredStar(0);
        },
        onError: (err) => {
          alert(`Failed to submit review: ${err.message}`);
        },
      }
    );
  };

  const handleBookingClick = () => {
    navigate("/booking");
  };

  const handleEditReview = () => {
    if (!trainer || !clientId || !editReviewId) return;
    updateReviewMutation.mutate(
      {
        reviewId: editReviewId,
        clientId,
        rating: newRating,
        comment: newReview,
        trainerId: trainer.trainer.id,
      },
      {
        onSuccess: () => {
          setNewReview("");
          setNewRating(0);
          setHoveredStar(0);
          setIsEditReviewModalOpen(false);
          setEditReviewId(null);
        },
        onError: (err) => {
          alert(`Failed to update review: ${err.message}`);
        },
      }
    );
  };

  const openEditReviewModal = (review: any) => {
    setEditReviewId(review.id);
    setNewReview(review.comment || "");
    setNewRating(review.rating);
    setIsEditReviewModalOpen(true);
  };

  const { data: allReviews, isLoading: reviewsLoading } =
    useFetchTrainerReviews(trainer?.trainer.id, 0, 10, {
      enabled: isReviewsModalOpen,
    });

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error || !trainer) {
    return (
      <div className="text-center py-8 text-red-600">
        {error || "Failed to load trainer profile"}
      </div>
    );
  }

  const renderStars = (rating: number, size: string = "text-base") => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`${size} ${i < rating ? "text-amber-400" : "text-gray-300"}`}
      />
    ));
  };

  const renderInteractiveStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`text-xl cursor-pointer transition-colors ${
          i < (hoveredStar || newRating)
            ? "text-amber-400"
            : "text-gray-300 hover:text-amber-200"
        }`}
        onMouseEnter={() => setHoveredStar(i + 1)}
        onMouseLeave={() => setHoveredStar(0)}
        onClick={() => setNewRating(i + 1)}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <div className="sticky top-8">
                <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-white via-purple-50/30 to-violet-100/40 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="relative mx-auto mb-6 w-32 h-32">
                      <img
                        src={
                          trainer.trainer.profileImage ||
                          "https://via.placeholder.com/150"
                        }
                        alt={trainer.trainer.fullName}
                        className="w-full h-full rounded-full object-cover shadow-lg ring-4 ring-purple-200/50"
                      />
                      <div className="absolute -bottom-2 -right-2">
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-full p-2 shadow-lg">
                              <FaCheckCircle className="h-4 w-4" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Verified Trainer</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-violet-700 bg-clip-text text-transparent">
                      {trainer.trainer.fullName}
                    </h1>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="flex">
                        {renderStars(Math.floor(trainer.reviews.averageRating))}
                      </div>
                      <span className="font-semibold text-purple-700">
                        {trainer.reviews.averageRating.toFixed(1)}
                      </span>
                      <span className="text-gray-500">
                        ({trainer.reviews.totalReviewCount} reviews)
                      </span>
                    </div>
                    <div className="space-y-3 mb-6 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Experience:</span>
                        <span className="font-medium text-purple-700">
                          {trainer.trainer.experience || 0} years
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Gender:</span>
                        <span className="font-medium text-purple-700">
                          {trainer.trainer.gender || "N/A"}
                        </span>
                      </div>
                      {trainer.trainer.age && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Age:</span>
                          <span className="font-medium text-purple-700">
                            {trainer.trainer.age} years
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3 text-left text-purple-700">
                        Certifications
                      </h3>
                      <div className="space-y-2">
                        {trainer.trainer.certifications?.length ? (
                          trainer.trainer.certifications.map((cert, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm text-left"
                            >
                              <FaCheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                              <span className="text-gray-700">{cert}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">
                            No certifications listed
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={handleBookingClick}
                      className="w-full rounded-2xl py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 hover:from-orange-500 hover:via-pink-600 hover:to-red-600 text-white border-0"
                    >
                      🌟 Book a Session
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="lg:col-span-8 space-y-8">
              <Card className="shadow-lg border-0 bg-gradient-to-br from-white via-violet-50/30 to-purple-100/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <FaTrophy className="h-5 w-5 text-amber-500" />
                    Skills & Specializations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {trainer.trainer.skills?.length ? (
                      trainer.trainer.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="px-4 py-2 text-sm font-medium rounded-full hover:scale-105 transition-transform duration-200 cursor-pointer shadow-md bg-gradient-to-r from-purple-100 to-violet-200 text-purple-700 border-purple-200 hover:from-purple-200 hover:to-violet-300"
                        >
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No skills listed</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="text-center shadow-lg border-0 bg-gradient-to-br from-purple-50 to-violet-100/50">
                  <CardContent className="p-6">
                    <FaUsers className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {trainer.performanceStats.clientsTrained}
                    </div>
                    <div className="text-sm text-gray-600">Clients Trained</div>
                  </CardContent>
                </Card>
                <Card className="text-center shadow-lg border-0 bg-gradient-to-br from-orange-50 to-pink-100/50">
                  <CardContent className="p-6">
                    <FaCalendarAlt className="h-8 w-8 text-orange-500 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {trainer.performanceStats.sessionsCompleted}
                    </div>
                    <div className="text-sm text-gray-600">
                      Sessions Completed
                    </div>
                  </CardContent>
                </Card>
                <Card className="text-center shadow-lg border-0 bg-gradient-to-br from-pink-50 to-red-100/50">
                  <CardContent className="p-6">
                    <FaChartLine className="h-8 w-8 text-pink-500 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-pink-600 mb-1">
                      {trainer.performanceStats.successRate
                        ? `${trainer.performanceStats.successRate}%`
                        : "N/A"}
                    </div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </CardContent>
                </Card>
              </div>
              <Card className="shadow-lg border-0 bg-gradient-to-br from-white via-orange-50/30 to-pink-100/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <FaCalendarAlt className="h-5 w-5 text-orange-500" />
                    Available Slots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {trainer.availableSlots.length ? (
                      trainer.availableSlots.map((slot) => (
                        <Card
                          key={slot.slotId}
                          className="p-4 text-center cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-orange-300 bg-gradient-to-br from-orange-50/80 to-pink-50/80"
                        >
                          <div className="font-semibold text-sm mb-2 text-orange-700">
                            {formatDate(slot.date)} {slot.startTime}-
                            {slot.endTime}
                          </div>
                        </Card>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        No available slots
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-lg border-0 bg-gradient-to-br from-white via-purple-50/30 to-violet-100/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <FaStar className="h-5 w-5 text-amber-500" />
                    Client Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {trainer.reviews.items.length ? (
                    trainer.reviews.items.map((review) => (
                      <Card
                        key={review.id}
                        className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/30 border border-purple-100"
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 ring-2 ring-purple-200">
                            <AvatarImage
                              src={review.clientProfileImage}
                              alt={review.clientName}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-purple-100 to-violet-200 text-purple-700">
                              {review.clientName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-purple-700">
                                {review.clientName}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {new Date(
                                    review.createdAt
                                  ).toLocaleDateString()}
                                </span>
                                {review.clientId === clientId && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditReviewModal(review)}
                                    className="text-purple-600 hover:text-purple-800"
                                  >
                                    <FaEdit className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div className="flex mb-2">
                              {renderStars(review.rating, "text-sm")}
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {review.comment || "No comment"}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No reviews yet</p>
                  )}
                  {!clientReview && trainer.reviews.canReview && (
                    <Card className="p-6 bg-gradient-to-br from-purple-50/80 to-violet-100/60 border-purple-200">
                      <h4 className="font-semibold mb-4 text-purple-700">
                        Add Your Review
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-purple-700">
                            Rating
                          </label>
                          <div className="flex gap-1">
                            {renderInteractiveStars()}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-purple-700">
                            Your Review
                          </label>
                          <Textarea
                            placeholder="Share your experience with this trainer..."
                            value={newReview}
                            onChange={(e) => setNewReview(e.target.value)}
                            className="min-h-[100px] resize-none border-purple-200 focus:border-purple-400"
                          />
                        </div>
                        <Button
                          className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white border-0"
                          disabled={
                            !newRating ||
                            !newReview.trim() ||
                            submitReviewMutation.isPending
                          }
                          onClick={handleSubmitReview}
                        >
                          {submitReviewMutation.isPending
                            ? "Submitting..."
                            : "Submit Review"}
                        </Button>
                        {submitReviewMutation.isError && (
                          <p className="text-sm text-red-600">
                            {submitReviewMutation.error.message}
                          </p>
                        )}
                      </div>
                    </Card>
                  )}
                  <Dialog
                    open={isEditReviewModalOpen}
                    onOpenChange={setIsEditReviewModalOpen}
                  >
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Your Review</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-purple-700">
                            Rating
                          </label>
                          <div className="flex gap-1">
                            {renderInteractiveStars()}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-purple-700">
                            Your Review
                          </label>
                          <Textarea
                            placeholder="Share your experience with this trainer..."
                            value={newReview}
                            onChange={(e) => setNewReview(e.target.value)}
                            className="min-h-[100px] resize-none"
                          />
                        </div>
                        <Button
                          className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white"
                          disabled={
                            !newRating ||
                            !newReview.trim() ||
                            updateReviewMutation.isPending
                          }
                          onClick={handleEditReview}
                        >
                          {updateReviewMutation.isPending
                            ? "Updating..."
                            : "Update Review"}
                        </Button>
                        {updateReviewMutation.isError && (
                          <p className="text-sm text-red-600">
                            {updateReviewMutation.error.message}
                          </p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog
                    open={isReviewsModalOpen}
                    onOpenChange={setIsReviewsModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                      >
                        View All Reviews
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>
                          All Reviews for {trainer.trainer.fullName}
                        </DialogTitle>
                      </DialogHeader>
                      {reviewsLoading ? (
                        <p>Loading reviews...</p>
                      ) : allReviews?.items.length ? (
                        <div className="space-y-4">
                          {allReviews.items.map((review) => (
                            <Card key={review.id} className="p-4">
                              <div className="flex items-start gap-4">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={review.clientProfileImage}
                                    alt={review.clientName}
                                  />
                                  <AvatarFallback>
                                    {review.clientName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold">
                                      {review.clientName}
                                    </h4>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(review.createdAt)}
                                    </span>
                                  </div>
                                  <div className="flex mb-2">
                                    {renderStars(review.rating, "text-sm")}
                                  </div>
                                  <p className="text-sm text-gray-700">
                                    {review.comment || "No comment"}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p>No reviews available</p>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TrainerProfile;
