import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import api from "../../api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import BackButton from "../../components/BackButton"
import Spinner from "../../components/Spinner"

const TeamPage = () => {
	const { teamId } = useParams<{ teamId: string }>()
	const { sprintId } = useParams<{ sprintId: string }>()

	const {
		data: team,
		error,
		isLoading,
	} = useQuery({
		queryKey: ["team", teamId],
		queryFn: async () => {
			const response = await api.get(`/teams/getTeam/${teamId}`)
			return response.data
		},
		enabled: !!teamId,
	})

	return (
		<div className="container mx-auto p-6">
			<BackButton useNavigateBack />

			{isLoading && <Spinner />}
			{error && <p className="text-red-500">Error loading team data: {error.message}</p>}

			{!isLoading && !error && (
				<div className="space-y-4 mb-10">
					<h1 className="text-3xl font-bold">Team: {teamId}</h1>
					<h2 className="text-xl font-semibold">Students</h2>
					{team?.students && team.students.length > 0 ? (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Computing ID</TableHead>
										<TableHead>GitHub ID</TableHead>
										<TableHead>Discord ID</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{team.students.map((student: any) => (
										<TableRow key={student.id} className="hover:bg-muted transition">
											<Link to={`/student/${student.computingID}/${sprintId}`} className="contents">
												<TableCell>
													{student.firstName} {student.lastName}
												</TableCell>
												<TableCell>{student.computingID}</TableCell>
												<TableCell>{student.githubID || "N/A"}</TableCell>
												<TableCell>{student.discordID || "N/A"}</TableCell>
												<TableCell>{student.active ? "Active" : "Not Active"}</TableCell>
											</Link>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					) : (
						<p className="text-muted-foreground">Unable to load information about {teamId}.</p>
					)}
				</div>
			)}
		</div>
	)
}

export default TeamPage
