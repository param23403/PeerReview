import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
const TeamPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<any | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/teams/getTeam/${teamId}`
        );
        setTeam(response.data);
      } catch (error) {
        console.error("Error fetching team data: ", error);
      }
    };

    fetchTeamData();
  }, [teamId]);
  const handleNavigate = (cid: string) => {
    navigate(`/student/${cid}`);
  };
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="mb-2 font-bold text-3xl">{teamId}</h1>
      </div>
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
                  <TableRow
                    key={student.id}
                    onClick={() => handleNavigate(student.computingID)}
                  >
                    <TableCell>
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell>{student.computingID}</TableCell>
                    <TableCell>{student.githubID || "N/A"}</TableCell>
                    <TableCell>{student.discordID || "N/A"}</TableCell>
                    <TableCell>
                      {student.active ? "Active" : "Not Active"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p>Unable to load information about {teamId}.</p>
        )}
      </div>
      <Link to="/teams" className="text-blue-500 hover:underline">
        Back to all teams
      </Link>
    </div>
  );
};

export default TeamPage;
