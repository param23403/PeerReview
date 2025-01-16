import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Skeleton } from "../components/ui/skeleton"
import { Separator } from "../components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip"
import { FaDiscord } from "react-icons/fa6"
import { FaGithub } from "react-icons/fa6"

interface StudentCardProps {
	name?: string
	computingId?: string
	team?: string
	githubId?: string
	discordId?: string
	active?: boolean
	loading?: boolean
}

const StudentCard: React.FC<StudentCardProps> = ({ name, computingId, team, githubId, discordId, active, loading }) => {
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
		<Card className="p-4 shadow-sm">
			<CardHeader className="flex justify-between items-start p-0 mb-2">
				<div>
					<div className="flex items-center space-x-2">
						<CardTitle className="text-lg font-bold">{name || "N/A"}</CardTitle>
						<Separator orientation="vertical" className="h-5" />
						<p className="text-sm text-muted-foreground">{computingId || "No Computing ID"}</p>
						<Separator orientation="vertical" className="h-5" />
						<p className="text-sm text-muted-foreground">Team: {team || "Unassigned"}</p>
					</div>
				</div>
			</CardHeader>

			<CardContent className="p-0">
				<div className="flex items-center text-sm text-muted-foreground space-x-4">
					<div className="flex items-center space-x-2">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>
									<FaGithub className="text-xl" />
								</TooltipTrigger>
								<TooltipContent>
									<p>GitHub</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						<p className="font-medium">{githubId || "N/A"}</p>
					</div>
					<Separator orientation="vertical" className="h-4" />
					<div className="flex items-center space-x-2">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>
									<FaDiscord className="text-xl" />
								</TooltipTrigger>
								<TooltipContent>
									<p>Discord</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						<p className="font-medium">{discordId || "N/A"}</p>
					</div>
				</div>
				<p className="mt-2 text-sm text-muted-foreground">{active ? "Joined PeerReview App" : "Not Yet Joined"}</p>
			</CardContent>
		</Card>
	)
}

export default StudentCard
