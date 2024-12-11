import { Link } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { CheckCircle, XCircle, ChevronRight, Lock } from 'lucide-react';

interface SprintReview {
  id: string;
  sprintNumber: number;
  sprintDueDate: Date;
  reviewDueDate: Date;

  // Will need to be removed a calculated in backend
  completedReviews: number;
  totalReviews: number;
}

const getSprintStatus = (sprint: SprintReview) => {
  const currentDate = new Date();
  const isPastSprintDueDate = currentDate > sprint.sprintDueDate;
  const isReviewOpen = isPastSprintDueDate && currentDate <= new Date(sprint.sprintDueDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { isPastSprintDueDate: isPastSprintDueDate, isReviewOpen: isReviewOpen };
};

// Function for adding days in mock data --> Should probably move logic to backend eventually
const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

// Mock data
const sprintReviews: SprintReview[] = [
  { id: "1", sprintNumber: 1, completedReviews: 6, totalReviews: 6, sprintDueDate: new Date(2024, 9, 2, 23, 59), reviewDueDate: addDays(new Date(2024, 10, 2, 23, 59), 7) },
  { id: "2", sprintNumber: 2, completedReviews: 5, totalReviews: 6, sprintDueDate: new Date(2024, 9, 16, 23, 59), reviewDueDate: addDays(new Date(2024, 10, 16, 23, 59), 7) },
  { id: "3", sprintNumber: 3, completedReviews: 6, totalReviews: 6, sprintDueDate: new Date(2024, 9, 30, 23, 59), reviewDueDate: addDays(new Date(2024, 10, 30, 23, 59), 7) },
  { id: "4", sprintNumber: 4, completedReviews: 6, totalReviews: 6, sprintDueDate: new Date(2024, 10, 13, 23, 59), reviewDueDate: addDays(new Date(2024, 11, 8, 23, 59), 7) },
  { id: "5", sprintNumber: 5, completedReviews: 6, totalReviews: 6, sprintDueDate: new Date(2024, 10, 27, 23, 59), reviewDueDate: addDays(new Date(2024, 11, 15, 23, 59), 7) },
  { id: "6", sprintNumber: 6, completedReviews: 2, totalReviews: 6, sprintDueDate: new Date(2024, 11, 10, 23, 59), reviewDueDate: addDays(new Date(2024, 11, 22, 23, 59), 7) }
];

function SprintCard({ sprint, isPastSprintDueDate, isReviewOpen }: { sprint: SprintReview; isPastSprintDueDate: boolean; isReviewOpen: boolean }) {
  const statusIcon = () => {
    if (!isReviewOpen) {
      return <Lock className="text-gray-500 w-6 h-6" />;
    }

    const isComplete = sprint.completedReviews === sprint.totalReviews;
    const Icon = isComplete ? CheckCircle : XCircle;
    const label = isComplete ? "Complete" : "Incomplete";

    return (
      <>
        <Icon className={`w-6 h-6 ${isComplete ? "text-green-500" : "text-red-500"}`} />
        <span className="mr-2">{label}</span>
      </>
    );
  };

  const statusLabel = () => {
    if (!isReviewOpen && !isPastSprintDueDate) return `Opens ${sprint.sprintDueDate.toLocaleDateString()}`;
    if (!isReviewOpen && isPastSprintDueDate) return `Closed ${sprint.reviewDueDate.toLocaleDateString()}`;
    return `Due ${sprint.reviewDueDate.toLocaleDateString()} ${sprint.reviewDueDate.toLocaleTimeString()}`;
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
          {isReviewOpen && (
            <ChevronRight className="text-gray-400 w-6 h-6" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentSprints() {
  return (
    <div className="container mx-auto p-4 flex justify-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Sprint Reviews</h1>
        <div className="space-y-8">
          {sprintReviews.map(sprint => {
            const { isPastSprintDueDate, isReviewOpen } = getSprintStatus(sprint);

            return isReviewOpen ? (
              <Link
                to={`/sprints/${sprint.id}/reviews`}
                state={{ sprint }}
                key={sprint.id}
                className="block transition-shadow duration-200 hover:shadow-lg"
                aria-label={`View details for Sprint ${sprint.sprintNumber}`}
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
