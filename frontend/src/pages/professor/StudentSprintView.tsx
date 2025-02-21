import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../api";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ReviewGrid } from "../../components/ReviewGrid";

interface SprintReview {
  reviewerId: string;
  reviewedTeammateId: string;
  keptUpWithResponsibilities: string;
  helpedTeamMembers: string;
  communicatedEffectively: string;
  ideasTakenSeriously: string;
  putInAppropriateTime: string;
  compatibility: string;
  overallEvaluationScore: string;
  improvementFeedback?: string;
  strengthFeedback?: string;
  isFlagged: boolean;
}

export default function StudentSprintView() {
  const { computingID, sprintId } = useParams<{ computingID: string; sprintId: string }>();
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["reviews", computingID, sprintId],
    queryFn: async () => {
      const response = await api.get(`/reviews/getReviewsForUserBySprint/${computingID}/${sprintId}`);
      return response.data;
    },
    enabled: !!computingID && !!sprintId,
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-4">
        <Button onClick={handleBackClick} className="mr-4">
          &lt; Back
        </Button>
        <h1 className="text-3xl font-bold text-primary">Team Reviews</h1>
      </div>

      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>
            Peer Reviews for {data?.name || "Unknown Student"} ({computingID}) - Sprint {sprintId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error instanceof Error ? error.message : "An unexpected error occurred."}</p>
          ) : data?.reviews.length > 0 ? (
            <ReviewGrid reviews={data.reviews} />
          ) : (
            <p>No reviews found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
