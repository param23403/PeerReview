import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../api";
import { Card, CardContent } from "../../components/ui/card";
import { useAuth } from "../../auth/useAuth";
import Spinner from "../../components/Spinner";

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
  const statusLabel = () => {
    const sprintDueDate =
      sprint?.sprintDueDate instanceof Date ? sprint.sprintDueDate : new Date();
    const reviewDueDate =
      sprint?.reviewDueDate instanceof Date ? sprint.reviewDueDate : new Date();

    if (!isReviewOpen && !isPastSprintDueDate) {
      return `Opens ${sprintDueDate.toLocaleDateString()}`;
    }
    if (!isReviewOpen && isPastSprintDueDate) {
      return `Closed ${reviewDueDate.toLocaleDateString()}`;
    }
    return `Due ${reviewDueDate.toLocaleDateString()} ${reviewDueDate.toLocaleTimeString()}`;
  };

  return (
    <Card>
      <CardContent className="p-4 flex justify-between items-center">
        <div className="flex-grow">
          <h2 className="text-lg font-semibold">
            Sprint {sprint.id}: {sprint.name || "Unnamed Sprint"}
          </h2>
          <p className="text-sm text-gray-500">{statusLabel()}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ManageSprints() {
  const { loading: authLoading } = useAuth();

  const { data: sprints, error, isLoading } = useQuery({
    queryKey: ["sprints"],
    queryFn: async () => {
      const response = await api.get("/sprints/getSprints");
      return response.data.map((sprint: any) => ({
        id: sprint.id || "",
        name: sprint.name || "Unnamed Sprint",
        sprintDueDate: new Date(sprint.sprintDueDate?._seconds * 1000 || Date.now()),
        reviewDueDate: new Date(sprint.reviewDueDate?._seconds * 1000 || Date.now()),
      }));
    },
    enabled: !authLoading,
  });

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
        <p>Failed to load sprints. Please retry.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex justify-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Edit Sprints</h1>
        <div className="space-y-8">
          {sprints?.map((sprint: Sprint) => {
            const { isPastSprintDueDate, isReviewOpen } = getSprintStatus(sprint);

            return (
              <Link
                to={`/edit-sprint/${sprint.id}`}
                state={{ sprint }}
                key={sprint.id}
                className="block transition-shadow duration-200 hover:shadow-lg"
                aria-label={`Edit Sprint ${sprint.id} details`}
              >
                <SprintCard sprint={sprint} isPastSprintDueDate={isPastSprintDueDate} isReviewOpen={isReviewOpen} />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  );
}