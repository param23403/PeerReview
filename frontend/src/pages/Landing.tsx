import { Button } from "../components/ui/button"
import { Link } from "react-router-dom"

export default function Landing() {
	return (
		<div className="bg-background text-foreground flex flex-col">
			{/* Hero Section */}
			<section className="h-[82vh] flex w-full bg-card py-16">
				<div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-center space-y-8 md:space-y-0 lg:space-x-32 py-12">
					<div className="text-left mb-8 lg:mb-0">
						<h2 className="text-2xl md:text-3xl">Welcome to</h2>
						<h1 className="text-4xl text-primary font-bold md:text-6xl">PeerReview</h1>
					</div>

					<div>
						<p className="text-muted-foreground text-xl max-w-2xl mb-8">
							Streamline peer evaluations for CS 3240 at UVA. Students review teammates, and professors track progress effortlessly.
						</p>
						<div className="flex flex-col lg:flex-row items-start pt-4 lg:pt-0 lg:items-end gap-4">
							<Link to="/login">
								<Button>Login</Button>
							</Link>
							<Link to="/signup-student">
								<Button variant="secondary">Sign Up as Student</Button>
							</Link>
							<Link to="/signup-professor">
								<Button variant="secondary">Sign Up as Professor</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>
			{/* Footer */}
			<footer className="w-full py-6 bg-background text-muted-foreground text-center border-t border-muted">
				© 2025 PeerReview | CS 3240 | University of Virginia
			</footer>
		</div>
	)
}
