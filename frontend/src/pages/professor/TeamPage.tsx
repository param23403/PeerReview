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
        console.error("Error fetching team data:", error)
      }
    }

    fetchTeamData()
  }, [teamId])

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="mb-2">{teamId} Page</h1>
        <h1 className="text-3xl font-bold text-primary">{team?.name}</h1>
        <Link to="/teams" className="text-blue-500 hover:underline">
          Back to all teams
        </Link>
      </div>
    </div>
  )
}

export default TeamPage