import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { CheckCircle, XCircle, ChevronRight, Lock } from "lucide-react";
import { useAuth } from "../../auth/useAuth";

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

function SprintCard({ sprint, isPastSprintDueDate, isReviewOpen }: { sprint: Sprint; isPastSprintDueDate: boolean; isReviewOpen: boolean; }) {
  const statusIcon = () => {
    if (!isReviewOpen) {
      return <Lock className="text-gray-500 w-6 h-6" />;
    }

    const isComplete = sprint.completedReviews === sprint.totalReviews;
    const Icon = isComplete ? CheckCircle : XCircle;

    return (
      <>
        <Icon className={`w-6 h-6 ${isComplete ? "text-green-500" : "text-red-500"}`}/>
        <span className="mr-2">
          {isComplete ? "Complete" : "Incomplete"}
        </span>
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
          <h2 className="text-lg font-semibold">Sprint {sprint.id}: {sprint.name}</h2>
          <p className="text-sm text-gray-500">{statusLabel()}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {statusIcon()}
            <span className="text-base text-gray-500">
              {sprint.completedReviews}/{sprint.totalReviews}
            </span>
          </div>
          {isReviewOpen && (
            <ChevronRight className="text-gray-400 w-6 h-6" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentSprints() {
  const { userData, loading: authLoading } = useAuth();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const studentId = userData?.studentId;
    if (!authLoading && studentId) {
      const fetchSprints = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/sprints/getStudentSprints/${studentId}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch sprints");
          }

          const sprintsData = await response.json();

          setSprints(
            sprintsData.map((sprint: any) => ({
              ...sprint,
              sprintDueDate: new Date(sprint.sprintDueDate._seconds * 1000),
              reviewDueDate: new Date(sprint.reviewDueDate._seconds * 1000),
            }))
          );
        } catch (err: any) {
          console.error("Error:", err);
          setError("Failed to load sprints. Please retry.");
        } finally {
          setLoading(false);
        }
      };

      fetchSprints();
    }
  }, [authLoading, userData]);

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
        <h1 className="text-2xl font-bold mb-4 text-center">Sprints</h1>
        <div className="space-y-8">
          {sprints.map((sprint) => {
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
