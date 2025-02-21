import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Skeleton } from "../components/ui/skeleton"
import { Separator } from "./ui/separator"

interface TeamCardProps {
	team?: any
	students?: any[]
	loading?: boolean
}

const TeamCard: React.FC<TeamCardProps> = ({ team, students, loading }) => {
	if (loading) {
		return (
			<Card className="p-4 shadow-sm">
				<Skeleton className="h-6 w-3/4 mb-2" />
				<Skeleton className="h-4 w-1/2" />
				<Skeleton className="h-4 w-1/4" />
			</Card>
		)
	}
	const getStatus = (score: number | null) => {
		if (score === null || score === undefined) {
			return { label: "not filled out", bgColor: "bg-grey" }
		} else if (score <= 2) {
			return { label: "bad", bgColor: "bg-red-500" }
		} else if (score <= 4) {
			return { label: "medium", bgColor: "bg-yellow-400" }
		}
		return { label: "good", bgColor: "bg-green-500" }
	}

	const status = getStatus(team?.minAvgScore)
	return (
		<Card className="shadow-sm mb-4 p-4">
			<CardHeader>
				<div className="md:flex items-center md:space-x-4">
					<CardTitle className="text-xl font-bold w-full md:w-auto mb-4 md:mb-0">{team.name || "Unnamed Team"}</CardTitle>
					<Separator orientation="vertical" className="hidden md:block h-4" />
					<p className="text-sm font-bold mb-2 md:mb-0">
						Min Score ID: <span className="font-medium">{team?.minId ?? "N/A"}</span>
					</p>
					<p className="text-sm font-bold mb-2 md:mb-0">
						Min Avg Score: <span className="font-medium">{team?.minAvgScore?.toFixed(2) ?? "N/A"}</span>
					</p>
					<p className="text-sm font-bold mb-2 md:mb-0">
						Pending Reviews: <span className="font-medium">{team?.pendingReviews ?? 0}</span>
					</p>
          <span className="grow"></span>
					<p className="text-sm font-medium mb-2 md:mb-0">
						Severity: <span className={`px-2 py-1 text-sm font-bold rounded-md ${status.bgColor}`}>{status.label}</span>
					</p>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex flex-wrap pt-4">
					{students?.map((student, index) => (
						<>
							{index > 0 && <Separator orientation="vertical" className="h-4 mx-2" />}
							<p key={student.computingId} className="text-sm text-muted-foreground mb-4 md:mb-0">
								{`${student.firstName} ${student.lastName} (${student.computingID})`}
							</p>
						</>
					))}
				</div>
			</CardContent>
		</Card>
	)
}

export default TeamCard
