import { Button } from "../../components/ui/button";
import { To, useNavigate } from "react-router-dom";

export default function ProfessorDashboard() {
  const navigate = useNavigate();

  const handleNavigation = (path: To) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <section className="w-full bg-muted py-16">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-bold text-primary">Professor Dashboard</h1>
          <p className="text-muted-foreground text-xl max-w-2xl mt-4">
            Create teams, monitor student evaluations, and track team progress.
          </p>
        </div>
      </section>

      <section className="py-8 px-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-8">
          <Button onClick={() => handleNavigation("/team-creation")}>
            Create Teams
          </Button>
          <Button onClick={() => handleNavigation("/students")}>
            View Students
          </Button>
          <Button onClick={() => handleNavigation("/teams")}>
            View Teams
          </Button>
        </div>

        <h2 className="text-xl text-center mb-8 pt-6">or select from sprints</h2>
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="grid grid-cols-1 gap-4 w-full max-w-md">
            {["Sprint 2", "Sprint 3", "Sprint 4", "Sprint 5", "Sprint 6"].map((sprint, index) => (
              <div
                key={index}
                className="bg-card text-card-foreground p-4 rounded-lg shadow hover:shadow-lg cursor-pointer text-center"
                onClick={() => console.log(`${sprint} clicked`)} // Replace with navigation logic
              >
                {sprint}
              </div>
            ))}
          </div>
        </div>

        <h2 className="text-4xl font-semibold text-center mb-8 pt-6">Red Flags</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card text-card-foreground p-4 rounded-lg shadow">
            <h3 className="text-xl font-bold">Low Ratings</h3>
            <p>Students with low ratings in peer evaluations.</p>
          </div>
          <div className="bg-card text-card-foreground p-4 rounded-lg shadow">
            <h3 className="text-xl font-bold">Team Conflicts</h3>
            <p>Reported issues within teams.</p>
          </div>
          <div className="bg-card text-card-foreground p-4 rounded-lg shadow">
            <h3 className="text-xl font-bold">Low Participation</h3>
            <p>Students who have not submitted evaluations.</p>
          </div>
        </div>
      </section>
    </div>
  );
}