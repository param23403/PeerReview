import { Link, useParams } from "react-router-dom";
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
}

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
        sprintDueDate: sprint.sprintDueDate?._seconds
          ? new Date(sprint.sprintDueDate._seconds * 1000)
          : new Date(),
        reviewDueDate: sprint.reviewDueDate?._seconds
          ? new Date(sprint.reviewDueDate._seconds * 1000)
          : new Date(),
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
        <h1 className="text-2xl font-bold mb-4 text-center">Select a Sprint</h1>
        <div className="space-y-8">
          {sprints.map((sprint: Sprint) => (
            <Link
              to={`/sprint/${sprint.id}`}
              state={{ sprint }}
              key={sprint.id}
              className="block transition-shadow duration-200 hover:shadow-lg"
              aria-label={`View Sprint ${sprint.id} details for ${computingID}`}
            >
              <SprintCard sprint={sprint} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
