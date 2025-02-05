import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
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

export default function () {
  const { computingID, sprintId } = useParams<{ computingID: string; sprintId: string }>();
  const [reviews, setReviews] = useState<SprintReview[]>([]);
  const [studentName, setStudentName] = useState<string>("");
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
    async function fetchReviews() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/reviews/getReviewsForUserBySprint/${computingID}/${sprintId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch reviews");
        }
        const data = await response.json();
        setReviews(data.reviews || []);
        setStudentName(data.name || "Unknown Student");
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setError(error instanceof Error ? error.message : "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [computingID, sprintId]);



  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-4">
        <Button onClick={handleBackClick} className="mr-4">
          &lt; Back
        </Button>
        <h1 className="text-3xl font-bold text-primary">
          Team Reviews
        </h1>
      </div>

      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>
            Peer Reviews for {studentName} ({computingID}) - Sprint {sprintId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : reviews.length > 0 ? (
            <ReviewGrid reviews={reviews} />
          ) : (
            <p>No reviews found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
