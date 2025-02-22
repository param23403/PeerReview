import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../api";
import { Card, CardContent } from "../../components/ui/card";
import { useAuth } from "../../auth/useAuth";
import { FaCheckCircle, FaTimesCircle, FaChevronRight } from "react-icons/fa";
import BackButton from "../../components/BackButton";
import Spinner from "../../components/Spinner";

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

  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ["sprintReviews", userData?.studentId, sprint?.id],
    queryFn: async () => {
      const reviewerId = userData?.studentId;
      if (!sprint?.id || !reviewerId) throw new Error("Missing sprintId or reviewerId");

      const response = await api.get(`/reviews/getReviews/${reviewerId}/${sprint.id}`);
      return response.data;
    },
    enabled: !!userData?.studentId && !!sprint?.id,
  });

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Failed to load reviews. Please retry.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex justify-center">
      <div className="w-full max-w-3xl">
        <BackButton to="/sprints" />
        <h1 className="text-2xl font-bold mb-4 text-center">
          Sprint {sprint?.id} - Submit reviews for your team members
        </h1>
        <div className="space-y-8">
          {reviews?.map((review: Review) => (
            <Link
              to={`/review/${review.reviewerId}/${review.reviewedTeammateId}`}
              state={{ review, sprint }}
              key={`${review.reviewedTeammateId}-${sprint.id}`}
              className="block hover:shadow-lg transition-shadow duration-200"
            >
              <Card>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold">{review.reviewedTeammateName}</h2>
                    <p className="text-sm text-muted-foreground">({review.reviewedTeammateId})</p>
                  </div>
                  <div className="flex items-center">
                    {review.reviewCompleted ? (
                      <FaCheckCircle className="text-success mr-2 w-5 h-5" />
                    ) : (
                      <FaTimesCircle className="text-destructive mr-2 w-5 h-5" />
                    )}
                    <span className="mr-2 text-muted-foreground">
                      {review.reviewCompleted ? "Submitted" : "Incomplete"}
                    </span>
                    <FaChevronRight className="text-muted-foreground w-5 h-5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
