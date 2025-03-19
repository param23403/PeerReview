import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../api";
import { Card, CardContent } from "../../components/ui/card";
import { useAuth } from "../../auth/useAuth";
import BackButton from "../../components/BackButton";

interface Sprint {
  id: string;
  name: string;
  sprintDueDate: Date;
  reviewDueDate: Date;
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
    if (!isReviewOpen && !isPastSprintDueDate) {
      return `Opens ${sprint?.sprintDueDate?.toLocaleDateString() ?? Date()}`;
    }

    if (!isReviewOpen && isPastSprintDueDate) {
      return `Closed ${sprint?.reviewDueDate?.toLocaleDateString() ?? Date()}`;
    }

    return `Due ${sprint?.reviewDueDate?.toLocaleDateString() ?? Date()} ${sprint?.reviewDueDate?.toLocaleTimeString() ?? Date()}`;
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

export default function ChooseSprint() {
  const { loading: authLoading } = useAuth();
  const { computingID } = useParams<{ computingID: string }>();

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
        <BackButton useNavigateBack />
        <h1 className="text-2xl font-bold mb-2 text-center">Select a Sprint</h1>
        <h2 className="text-lg text-muted-foreground text-center mb-4">View Sprint details for {computingID}</h2>
        <div className="space-y-8">
          {sprints?.map((sprint: Sprint) => {
            const { isPastSprintDueDate, isReviewOpen } = getSprintStatus(sprint);

            return (
              <Link
                to={`${sprint.id}`}
                state={{ sprint }}
                key={sprint.id}
                className="block transition-shadow duration-200 hover:shadow-lg"
                aria-label={`View Sprint ${sprint.id} details for ${computingID}`}
              >
                <SprintCard
                  sprint={sprint}
                  isPastSprintDueDate={isPastSprintDueDate}
                  isReviewOpen={isReviewOpen}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}