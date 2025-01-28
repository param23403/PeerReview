import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Skeleton } from "../components/ui/skeleton"
import { Separator } from "../components/ui/separator"

interface ReviewCardProps {
	reviewerName?: string
	revieweeName?: string
	team?: string
	sprintId?: string
	redFlag?: boolean
	loading?: boolean
}

const ReviewCard: React.FC<ReviewCardProps> = ({ reviewerName, revieweeName, team, sprintId, redFlag, loading }) => {
	if (loading) {
		return (
			<Card className="p-4 shadow-sm">
				<Skeleton className="h-6 w-3/4 mb-2" />
				<Skeleton className="h-4 w-1/2" />
				<Skeleton className="h-4 w-1/4" />
			</Card>
		)
	}

	return (
		<Card className={`p-4 shadow-sm ${redFlag ? "border-destructive bg-destructive/10" : "border-muted bg-card"}`}>
			<CardHeader className="flex justify-between items-start p-0 mb-2">
				<div>
					<div className="flex items-center space-x-2">
						<CardTitle className="text-lg font-bold">{revieweeName || "N/A"}</CardTitle>
						<Separator orientation="vertical" className="h-5" />
						<p className="text-sm text-muted-foreground">Reviewed by: {reviewerName || "Unknown"}</p>
					</div>
				</div>
			</CardHeader>

			<CardContent className="p-0">
				<div className="flex items-center text-sm text-muted-foreground space-x-4">
					<div className="flex items-center">
						<span className="text-muted-foreground mr-1">Team:</span>
						<span className="font-medium">{team || "Unassigned"}</span>
					</div>
					<Separator orientation="vertical" className="h-4" />
					<div className="flex items-center">
						<span className="text-muted-foreground mr-1">Sprint:</span>
						<span className="font-medium">{sprintId || "Sprint not specified"}</span>
					</div>
				</div>
				{redFlag && <p className="mt-2 text-sm text-destructive-foreground font-bold">This review contains a red flag.</p>}
			</CardContent>
		</Card>
	)
}

export default ReviewCard
