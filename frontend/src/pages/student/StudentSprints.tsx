import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../api";
import { Card, CardContent } from "../../components/ui/card";
import { useAuth } from "../../auth/useAuth";
import { FaLock, FaCheckCircle, FaTimesCircle, FaChevronRight } from "react-icons/fa";

interface Sprint {
  id: string;
  name: string;
  sprintDueDate: Date;
  reviewDueDate: Date;
  completedReviews: number;
  totalReviews: number;
}

const getSprintStatus = (sprint: Sprint) => {
  const currentDate = new Date();
  const isPastSprintDueDate = currentDate > sprint.sprintDueDate;
  const isReviewOpen = isPastSprintDueDate && currentDate <= sprint.reviewDueDate;
  return { isPastSprintDueDate, isReviewOpen };
};

function SprintCard({
  sprint,
  isPastSprintDueDate = false,
  isReviewOpen = false,
}: {
  sprint: Sprint;
  isPastSprintDueDate?: boolean;
  isReviewOpen?: boolean;
}) {
  const statusIcon = () => {
    if (!isReviewOpen) {
      return <FaLock className="text-muted-foreground w-6 h-6" />;
    }

    const isComplete = sprint.completedReviews === sprint.totalReviews;
    const Icon = isComplete ? FaCheckCircle : FaTimesCircle;

    return (
      <>
        <Icon
          className={`w-6 h-6 ${
            isComplete ? "text-success" : "text-destructive"
          }`}
        />
        <span className="mr-2">{isComplete ? "Complete" : "Incomplete"}</span>
      </>
    );
  };

  const statusLabel = () => {
    if (!isReviewOpen && !isPastSprintDueDate) {
      return `Opens ${sprint.sprintDueDate.toLocaleDateString()}`;
    }

    if (!isReviewOpen && isPastSprintDueDate) {
      return `Closed ${sprint.reviewDueDate.toLocaleDateString()}`;
    }

    return `Due ${sprint.reviewDueDate.toLocaleDateString()} ${sprint.reviewDueDate.toLocaleTimeString()}`;
  };

  return (
    <Card>
      <CardContent className="p-4 flex justify-between items-center">
        <div className="flex-grow">
          <h2 className="text-lg font-semibold">
            Sprint {sprint.id}: {sprint.name || "Unnamed Sprint"}
          </h2>
          <p className="text-sm text-muted-foreground">{statusLabel()}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {statusIcon()}
            <span className="text-base text-muted-foreground">
              {sprint.completedReviews ?? 0}/{sprint.totalReviews ?? 0}
            </span>
          </div>
          {isReviewOpen && <FaChevronRight className="text-muted-foreground w-6 h-6" />}
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentSprints() {
  const { userData, loading: authLoading } = useAuth();

  const { data: sprints, isLoading, error } = useQuery({
    queryKey: ["studentSprints", userData?.studentId],
    queryFn: async () => {
      const studentId = userData?.studentId;
      if (!studentId) throw new Error("Student ID is required");

      const response = await api.get(`/sprints/getStudentSprints/${studentId}`);
      return response.data.map((sprint: any) => ({
        id: sprint.id || "",
        name: sprint.name || "Unnamed Sprint",
        sprintDueDate: new Date(sprint.sprintDueDate?._seconds * 1000 || Date.now()),
        reviewDueDate: new Date(sprint.reviewDueDate?._seconds * 1000 || Date.now()),
        completedReviews: sprint.completedReviews ?? 0,
        totalReviews: sprint.totalReviews ?? 0,
      }));
    },
    enabled: !!userData?.studentId,
  });

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading authentication...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading sprints...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Failed to load sprints. Please retry.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex justify-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Sprints</h1>
        <div className="space-y-8">
          {sprints?.map((sprint: Sprint) => {
            const { isPastSprintDueDate, isReviewOpen } = getSprintStatus(sprint);

            return isReviewOpen ? (
              <Link
                to={`/sprints/${sprint.id}/reviews`}
                state={{ sprint }}
                key={sprint.id}
                className="block transition-shadow duration-200 hover:shadow-lg"
                aria-label={`View details for Sprint ${sprint.id}`}
              >
                <SprintCard sprint={sprint} isPastSprintDueDate={isPastSprintDueDate} isReviewOpen={isReviewOpen} />
              </Link>
            ) : (
              <div key={sprint.id} className="cursor-not-allowed">
                <SprintCard sprint={sprint} isPastSprintDueDate={isPastSprintDueDate} isReviewOpen={isReviewOpen} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
