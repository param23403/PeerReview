import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { ReviewGrid } from "../../components/ReviewGrid";
import { Button } from "../../components/ui/button";

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
  sprintId: string;
}

export default function ReviewView() {
  const { reviewId } = useParams<{ reviewId: string }>();

  const [review, setReview] = useState<SprintReview>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleBackClick = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };

  useEffect(() => {
    async function fetchReview() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/reviews/getReviewById/${reviewId}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch review");
        }
        const data = await response.json();
        setReview(data.review || []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchReview();
  }, [reviewId]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-4">
        <Button onClick={handleBackClick} className="mr-4">
          &lt; Back
        </Button>
      </div>

      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>
            Peer Reviews for {review?.reviewedTeammateId} - Sprint{" "}
            {review?.sprintId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : review ? (
            <ReviewGrid reviews={[review]} />
          ) : (
            <p>No review found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
