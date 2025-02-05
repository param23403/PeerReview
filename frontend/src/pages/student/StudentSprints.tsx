import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { useAuth } from "../../auth/useAuth";

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
          <p className="text-sm text-gray-500">{statusLabel()}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentSprints() {
  const { loading: authLoading } = useAuth();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { computingID } = useParams<{ computingID: string }>();

  useEffect(() => {
    if (!authLoading) {
      const fetchSprints = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/sprints/getSprints`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch sprints");
          }

          const sprintsData = await response.json();

          if (Array.isArray(sprintsData)) {
            setSprints(
              sprintsData.map((sprint: any) => ({
                id: sprint.id || "",
                name: sprint.name || "Unnamed Sprint",
                sprintDueDate: new Date(
                  sprint.sprintDueDate?._seconds * 1000 || Date.now()
                ),
                reviewDueDate: new Date(
                  sprint.reviewDueDate?._seconds * 1000 || Date.now()
                ),
              }))
            );
          } else {
            throw new Error("Invalid sprint data format");
          }
        } catch (err: any) {
          console.error("Error:", err);
          setError("Failed to load sprints. Please retry.");
        } finally {
          setLoading(false);
        }
      };

      fetchSprints();
    }
  }, [authLoading]);

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
        <h1 className="text-2xl font-bold mb-4 text-center">Select a Sprint</h1>
        <div className="space-y-8">
          {sprints.map((sprint) => {
            return (
              <Link
                to={`/student/${computingID}/${sprint.id}`}
                state={{ sprint }}
                key={sprint.id}
                className="block transition-shadow duration-200 hover:shadow-lg"
                aria-label={`View Sprint ${sprint.id} details for ${computingID}`}
              >
                <SprintCard sprint={sprint} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
