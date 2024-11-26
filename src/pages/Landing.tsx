import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  const [isProfessor, setIsProfessor] = useState(false); // Toggle between student and professor view
  const handleClick = () => {
    navigate("/login");
  };
  return (
    <div className="mt-16 min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
      {/* Hero Section */}
      <section className="text-center p-6">
        <h1 className="text-4xl font-bold mb-4">Welcome to PeerReview</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Streamline peer evaluations for CS 3240 at UVA. Students review their
          teammates after each sprint, and professors monitor progress
          effortlessly.
        </p>
        <Button
          className="bg-primary text-primary-foreground"
          onClick={handleClick}
        >
          {isProfessor ? "Login as Professor" : "Login as Student"}
        </Button>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-5xl mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card text-card-foreground p-4">
          <CardHeader className="text-xl font-bold">
            Automated Reminders
          </CardHeader>
          <CardContent>
            Never miss an evaluation with automatic reminders after every
            sprint.
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground p-4">
          <CardHeader className="text-xl font-bold">
            Progress Tracking
          </CardHeader>
          <CardContent>
            Professors can track team progress and see all evaluations in one
            place.
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground p-4">
          <CardHeader className="text-xl font-bold">Red Flag Alerts</CardHeader>
          <CardContent>
            Get notified when there are issues in a team that need attention.
          </CardContent>
        </Card>
      </section>

      {/* How It Works Section */}
      <section className="w-full max-w-5xl mt-16 p-6 text-center">
        <h2 className="text-2xl font-semibold mb-4">How PeerReview Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Students */}
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="text-xl font-bold">For Students</h3>
            <ul className="list-disc list-inside mt-4 text-left">
              <li>Receive email reminders after each sprint.</li>
              <li>Submit peer evaluations quickly online.</li>
              <li>Notify professors of any red flags.</li>
            </ul>
          </div>

          {/* For Professors */}
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="text-xl font-bold">For Professors</h3>
            <ul className="list-disc list-inside mt-4 text-left">
              <li>Access all team evaluations in one dashboard.</li>
              <li>Monitor team dynamics and progress.</li>
              <li>Receive alerts for red flags or problematic teams.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full mt-auto py-6 bg-muted text-muted-foreground text-center">
        © 2024 PeerReview | CS 3240 | University of Virginia
      </footer>
    </div>
  );
}
