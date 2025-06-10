import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, ThumbsUp } from "lucide-react";
import { useClientFeedback } from "@/hooks/trainer/useTrainerDashboard";
import { formatDistanceToNow } from "date-fns";
import { AvatarImage } from "@radix-ui/react-avatar";
import { useNavigate } from "react-router-dom";

interface ClientFeedbackProps {
  trainerId: string;
}

const ClientFeedback: React.FC<ClientFeedbackProps> = ({ trainerId }) => {
    const navigate = useNavigate();
  const { data: reviews, isLoading, error } = useClientFeedback(trainerId, 5);
  console.log(reviews, "reviews");
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
        }`}
      />
    ));
  };

  if (isLoading) return <div>Loading feedback...</div>;
  if (error) return <div>Error loading feedback: {error.message}</div>;

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          Recent Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6">
          {reviews && reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div
                key={review.id}
                className="p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors duration-200 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    {review.clientProfileImage ? (
                      <AvatarImage
                        src={review.clientProfileImage}
                        alt={review.clientName}
                      />
                    ) : (
                      <AvatarFallback className="bg-blue-500 text-white font-medium text-sm">
                        {review.clientName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-900 text-sm">
                        {review.clientName}
                      </h4>
                      <span className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mb-2">
                      {renderStars(review.rating)}
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {review.comment || "No comment provided"}
                    </p>

                    <div className="flex items-center gap-1 mt-2 text-slate-400">
                      <ThumbsUp className="w-3 h-3" />
                      <span className="text-xs">Helpful</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-slate-500">
              No feedback available
            </div>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full border-slate-200 text-slate-700 hover:bg-slate-50"
          onClick={() => navigate(`/trainer/${trainerId}/reviews`)}
        >
          View All Reviews
        </Button>
      </CardContent>
    </Card>
  );
};

export default ClientFeedback;
