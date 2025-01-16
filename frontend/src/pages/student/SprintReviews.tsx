import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { useAuth } from "../../auth/useAuth";

interface Review {
  id: string;
  reviewerId: string;
  sprintId: string;
  reviewedTeammateId: string;
  reviewedTeammateName: string;
  reviewCompleted: boolean;
}

export default function SprintReviews() {
  const location = useLocation();
  const { sprint } = location.state || {};
  const { userData, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    const reviewerId = userData?.studentId;

    const fetchReviews = async () => {
      if (!sprint?.id || !reviewerId) {
        setError("Missing sprintId or reviewerId.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/reviews/getReviews/${reviewerId}/${sprint.id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const reviewsData: Review[] = await response.json();
        setReviews(reviewsData);
      } catch (err: any) {
        console.error("Error fetching reviews:", err);
        setError("Failed to load reviews. Please retry.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [authLoading, sprint]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading authentication...</p>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading sprints...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>{error}</p>
      </div>
    );
  }  

  return (
    <div className="container mx-auto p-4 flex justify-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Sprint {sprint?.id} - Submit reviews for your team members
        </h1>
        <div className="space-y-8">
          {reviews.map((review) => {
            return (
              <Link
                to={`/review/${review.id}`}
                state={{ review, sprint }}
                key={`${review.reviewedTeammateId}-${sprint.id}`}
                className="block hover:shadow-lg transition-shadow duration-200"
              >
                <Card>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h2 className="font-semibold">{review.reviewedTeammateName}</h2>
                      <p className="text-sm text-gray-500">({review.reviewedTeammateId})</p>
                    </div>
                    <div className="flex items-center">
                      {review.reviewCompleted ? (
                        <CheckCircle className="text-green-500 mr-2" />
                      ) : (
                        <XCircle className="text-red-500 mr-2" />
                      )}
                      <span className="mr-2">
                        {review.reviewCompleted ? "Submitted" : "Incomplete"}
                      </span>
                      <ChevronRight className="text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
