import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import { Link } from "react-router-dom"

const TeamPage = () => {
  const { teamId } = useParams<{ teamId: string }>() 
  const [team, setTeam] = useState<any | null>(null)

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/teams/getTeam/${teamId}`)
        setTeam(response.data)
      } catch (error) {
        console.error("Error fetching team data: ", error)
      }
    }

    fetchTeamData()
  }, [teamId])

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="mb-2 font-bold text-3xl">{teamId}</h1>
        <h1 className="text-3xl font-bold text-primary">{team?.name}</h1>
      </div>
      <div className="space-y-4 mb-10">
        <h2 className="text-2xl font-semibold">Students</h2>
        {team?.students && team.students.length > 0 ? (
          <ul>
            {team.students.map((student: any) => (
              <li key={student.computingID} className="py-2">
                <span className="font-medium">{student.firstName} {student.lastName}</span> ({student.computingID})
              </li>
            ))}
          </ul>
        ) : (
          <p>Unable to load information about {teamId}.</p>
        )}
      </div>
      <Link to="/teams" className="text-blue-500 hover:underline">
          Back to all teams
      </Link>
    </div>
  )
}

export default TeamPage