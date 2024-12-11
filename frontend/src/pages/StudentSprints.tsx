import { Link } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { CheckCircle, XCircle, ChevronRight, Lock } from 'lucide-react';

interface SprintReview {
  id: string;
  sprintNumber: number;
  completedReviews: number;
  totalReviews: number;
  dueDate: Date;
  isLocked: boolean;
}

const sprintReviews: SprintReview[] = [
  { id: "1", sprintNumber: 1, completedReviews: 6, totalReviews: 6, dueDate: new Date(2024, 10, 2, 23, 59), isLocked: true },
  { id: "2", sprintNumber: 2, completedReviews: 5, totalReviews: 6, dueDate: new Date(2024, 10, 16, 23, 59), isLocked: true },
  { id: "3", sprintNumber: 3, completedReviews: 6, totalReviews: 6, dueDate: new Date(2024, 10, 30, 23, 59), isLocked: true },
  { id: "4", sprintNumber: 4, completedReviews: 6, totalReviews: 6, dueDate: new Date(2024, 11, 8, 23, 59), isLocked: true },
  { id: "5", sprintNumber: 5, completedReviews: 4, totalReviews: 6, dueDate: new Date(2024, 11, 15, 23, 59), isLocked: false },
  { id: "6", sprintNumber: 6, completedReviews: 0, totalReviews: 6, dueDate: new Date(2024, 11, 22, 23, 59), isLocked: true },
];

function SprintCard({ sprint, isPastDue }: { sprint: SprintReview; isPastDue: boolean;}) {
  const statusIcon = () => {
    if (isPastDue || sprint.isLocked) return <Lock className="text-gray-500 w-6 h-6" />;
    if (sprint.completedReviews === sprint.totalReviews) return <CheckCircle className="text-green-500 w-6 h-6" />;
    return <XCircle className="text-red-500 w-6 h-6" />;
  };

  const statusLabel = () => {
    if (sprint.isLocked) return `Opens ${sprint.dueDate.toLocaleDateString()}`;
    if (isPastDue) return `Finished ${sprint.dueDate.toLocaleDateString()}`;
    return `Due ${sprint.dueDate.toLocaleDateString()} ${sprint.dueDate.toLocaleTimeString()}`;
  };

  return (
    <Card>
      <CardContent className="p-4 flex justify-between items-center">
        <div className="flex-grow">
          <h2 className="text-lg font-semibold">Sprint {sprint.sprintNumber}</h2>
          <p className="text-sm text-gray-500">{statusLabel()}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {statusIcon()}
            <span className="text-base text-gray-500">
              {sprint.completedReviews}/{sprint.totalReviews}
            </span>
          </div>
          {!sprint.isLocked && !isPastDue && (
            <ChevronRight className="text-gray-400 w-6 h-6" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentSprints() {
  const currentDate = new Date();

  return (
    <div className="container mx-auto p-4 flex justify-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Sprint Reviews</h1>
        <div className="space-y-4">
          {sprintReviews.map(sprint => {
            const isPastDue = currentDate > sprint.dueDate;

            return sprint.isLocked ? (
              <div key={sprint.id} className="cursor-not-allowed">
                <SprintCard sprint={sprint} isPastDue={isPastDue} />
              </div>
            ) : (
              <Link
                to={`/sprints/${sprint.id}/reviews`}
                state={{ sprint }}
                key={sprint.id}
                className="block transition-shadow duration-200 hover:shadow-lg"
                aria-label={`View details for Sprint ${sprint.sprintNumber}`}
              >
                <SprintCard sprint={sprint} isPastDue={isPastDue} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
