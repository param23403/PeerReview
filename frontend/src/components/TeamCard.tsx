import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Separator } from "../components/ui/separator";

interface TeamCardProps {
  team?: any;
  students?: any[];
  loading?: boolean;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, students, loading }) => {
  if (loading) {
    return (
      <Card className="p-4 shadow-sm">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
      </Card>
    );
  }
  const getStatus = (score: number | null) => {
    if (score === null || score === undefined) {
      return { label: "not filled out", bgColor: "bg-grey" };
    } else if (score <= 2) {
      return { label: "bad", bgColor: "bg-red-500" };
    } else if (score <= 4) {
      return { label: "medium", bgColor: "bg-yellow-400" };
    }
    return { label: "good", bgColor: "bg-green-500" };
  };

  const status = getStatus(team?.minAvgScore);
  return (
    <Card className="p-4 shadow-sm">
      <CardHeader className="flex-row justify-between items-start p-0 mb-2">
        <div>
          <CardTitle className="text-lg font-bold">
            {team.name || "Unnamed Team"}
          </CardTitle>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium">
            Pending reviews: {team?.pendingReviews ?? 0}
          </span>
          <span
            className={`text-sm font-bold text-black px-2 py-1 rounded ${status.bgColor}`}
          >
            {status.label}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="space-y-2">
          {students?.map((student) => (
            <div
              key={student.computingId}
              className="flex items-center text-sm text-muted-foreground space-x-4"
            >
              <div className="flex items-center">
                <span className="text-muted-foreground mr-1">Name:</span>
                <span className="font-medium">
                  {student.firstName} {student.lastName}
                </span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center">
                <span className="text-muted-foreground mr-1">GitHub:</span>
                <span className="font-medium">{student.githubID || "N/A"}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center">
                <span className="text-muted-foreground mr-1">Discord:</span>
                <span className="font-medium">
                  {student.discordID || "N/A"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamCard;
