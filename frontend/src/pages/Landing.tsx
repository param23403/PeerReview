import { Card, CardContent, CardHeader } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { useNavigate } from "react-router-dom"

export default function Landing() {
	const navigate = useNavigate()

	const handleNavigation = (path: string) => {
		navigate(path)
	}

	return (
		<div className="min-h-screen bg-background text-foreground flex flex-col">
			{/* Hero Section */}
			<section className="w-full bg-muted py-16">
				<div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between py-12">
					<div className="text-center md:text-left mb-8 md:mb-0">
						<h2 className="text-3xl">Welcome to</h2>
						<h1 className="text-primary font-bold text-6xl">PeerReview</h1>
					</div>

					<div>
						<p className="text-muted-foreground text-xl max-w-2xl mb-8">
							Streamline peer evaluations for CS 3240 at UVA. Students review teammates, and professors track progress effortlessly.
						</p>
						<div className="flex items-center md:items-end gap-4">
							<Button onClick={() => handleNavigation("/login")}>
								Login
							</Button>
							<Button onClick={() => handleNavigation("/signup-student")} variant="secondary">
								Sign Up as Student
							</Button>
							<Button onClick={() => handleNavigation("/signup-professor")} variant="secondary">
								Sign Up as Professor
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="w-full max-w-7xl mx-auto py-16 px-4">
				<h2 className="text-2xl font-semibold text-center mb-8">Features</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Card className="bg-card text-card-foreground p-4">
						<CardHeader className="text-xl font-bold">Automated Reminders</CardHeader>
						<CardContent>Never miss an evaluation with automatic reminders after every sprint.</CardContent>
					</Card>
					<Card className="bg-card text-card-foreground p-4">
						<CardHeader className="text-xl font-bold">Progress Tracking</CardHeader>
						<CardContent>Professors can track team progress and see all evaluations in one place.</CardContent>
					</Card>
					<Card className="bg-card text-card-foreground p-4">
						<CardHeader className="text-xl font-bold">Red Flag Alerts</CardHeader>
						<CardContent>Get notified when there are issues in a team that need attention.</CardContent>
					</Card>
				</div>
			</section>

			{/* How It Works Section */}
			<section className="w-full bg-muted py-16 px-4">
				<div className="max-w-7xl mx-auto text-center">
					<h2 className="text-2xl font-semibold mb-8">How PeerReview Works</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{/* For Students */}
						<div className="bg-card p-6 rounded-lg">
							<h3 className="text-xl font-bold">For Students</h3>
							<ul className="list-disc list-inside mt-4 text-left">
								<li>Receive email reminders after each sprint.</li>
								<li>Submit peer evaluations quickly online.</li>
								<li>Notify professors of any red flags.</li>
							</ul>
						</div>

						{/* For Professors */}
						<div className="bg-card p-6 rounded-lg">
							<h3 className="text-xl font-bold">For Professors</h3>
							<ul className="list-disc list-inside mt-4 text-left">
								<li>Access all team evaluations in one dashboard.</li>
								<li>Monitor team dynamics and progress.</li>
								<li>Receive alerts for red flags or problematic teams.</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="w-full py-6 bg-background text-muted-foreground text-center border-t border-muted">
				© 2024 PeerReview | CS 3240 | University of Virginia
			</footer>
		</div>
	)
}
