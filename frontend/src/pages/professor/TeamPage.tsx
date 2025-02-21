import { useNavigate, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import api from "../../api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Button } from "../../components/ui/button"

const TeamPage = () => {
	const { teamId } = useParams<{ teamId: string }>()
	const { sprintId } = useParams<{ sprintId: string }>()
	const navigate = useNavigate()

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

	const handleNavigate = (cid: string) => {
		navigate(`/student/${cid}/${sprintId}`)
	}

	const handleBackClick = () => {
		if (window.history.length > 2) {
			navigate(-1)
		} else {
			navigate("/", { replace: true })
		}
	}

	return (
		<div className="container mx-auto p-6">
			<div className="mb-6">
				<Button onClick={handleBackClick} className="mr-4">
					&lt; Back
				</Button>
				<h1 className="mb-2 font-bold text-3xl">{teamId}</h1>
			</div>

			{isLoading && <p>Loading team data...</p>}
			{error && <p>Error loading team data: {error.message}</p>}

			{!isLoading && !error && (
				<div className="space-y-4 mb-10">
					<h2 className="text-2xl font-semibold">Students</h2>
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
										<TableRow key={student.id} onClick={() => handleNavigate(student.computingID)}>
											<TableCell>
												{student.firstName} {student.lastName}
											</TableCell>
											<TableCell>{student.computingID}</TableCell>
											<TableCell>{student.githubID || "N/A"}</TableCell>
											<TableCell>{student.discordID || "N/A"}</TableCell>
											<TableCell>{student.active ? "Active" : "Not Active"}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					) : (
						<p>Unable to load information about {teamId}.</p>
					)}
				</div>
			)}
		</div>
	)
}

export default TeamPage
