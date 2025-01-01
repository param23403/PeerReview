import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { toast } from "../../hooks/use-toast"
import { Toaster } from "../../components/ui/toaster"
import { FirebaseError } from "firebase/app"
import { getFirebaseErrorMessage } from "../../lib/utils"

interface StudentData {
    team: string
	firstName: string
    lastName: string
	computingID: string
    preferredPronouns: string
    githubID: string
    discordID: string
}

export default function AddStudents() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState<StudentData>({
        team: "",
        firstName: "",
        lastName: "",
        computingID: "",
        preferredPronouns: "",
        githubID: "",
        discordID: ""
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.target
		setFormData((prev) => ({
			...prev,
			[id]: value,
		}))
	}

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        try {
            const response = await fetch("/api/students/addStudent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new FirebaseError("api/failure", errorData.message || "Failed to add student");
            }
    
            const data = await response.json();
            console.log("Student added successfully:", data);
    
            navigate("/professor-dashboard");
        } catch (error) {
            if (error instanceof FirebaseError) {
				const errorMessage = getFirebaseErrorMessage(error.code)
				toast({
					title: "Error",
					description: errorMessage,
					variant: "destructive",
					duration: 3000,
				})
			} else {
				toast({
					title: "Error",
					description: "An unexpected error occurred. Please try again.",
					variant: "destructive",
					duration: 3000,
				})
			}
			console.error("Error logging in:", error)
        }
    }

    return (
        <div className="container mx-auto flex items-center justify-center bg-background text-foreground">
			<Card className="w-full max-w-lg shadow-md border border-muted">
				<CardHeader>
					<CardTitle className="text-center text-xl font-semibold">Add Student to Team</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
                        <div>
							<Label htmlFor="team" className="block mb-1 text-sm font-medium">
								Team Name
							</Label>
							<Input
								id="team"
								type="team"
								placeholder="Enter Student's Team"
								value={formData.team}
								onChange={handleInputChange}
								className="block w-full"
								required
							/>
						</div>
						<div>
							<Label htmlFor="firstName" className="block mb-1 text-sm font-medium">
								First Name
							</Label>
							<Input
								id="firstName"
								type="firstName"
								placeholder="Enter Student First Name"
								value={formData.firstName}
								onChange={handleInputChange}
								className="block w-full"
								required
							/>
						</div>
                        <div>
							<Label htmlFor="lastName" className="block mb-1 text-sm font-medium">
								Last Name
							</Label>
							<Input
								id="lastName"
								type="lastName"
								placeholder="Enter Student Last Name"
								value={formData.lastName}
								onChange={handleInputChange}
								className="block w-full"
								required
							/>
						</div>
                        <div>
							<Label htmlFor="computingID" className="block mb-1 text-sm font-medium">
                                Computing ID
							</Label>
							<Input
								id="computingID"
								type="computingID"
								placeholder="Enter Student Computing ID"
								value={formData.computingID}
								onChange={handleInputChange}
								className="block w-full"
								required
							/>
						</div>
                        <div>
							<Label htmlFor="preferredPronouns" className="block mb-1 text-sm font-medium">
								Preferred Pronouns
							</Label>
							<Input
								id="preferredPronouns"
								type="preferredPronouns"
								placeholder="Enter Student First Name"
								value={formData.preferredPronouns}
								onChange={handleInputChange}
								className="block w-full"
								required
							/>
						</div>
                        <div>
							<Label htmlFor="githubID" className="block mb-1 text-sm font-medium">
								Github ID
							</Label>
							<Input
								id="githubID"
								type="githubID"
								placeholder="Enter Student Github ID"
								value={formData.githubID}
								onChange={handleInputChange}
								className="block w-full"
								required
							/>
						</div>
                        <div>
							<Label htmlFor="discordID" className="block mb-1 text-sm font-medium">
								Discord ID
							</Label>
							<Input
								id="discordID"
								type="discordID"
								placeholder="Enter Student Discord ID"
								value={formData.discordID}
								onChange={handleInputChange}
								className="block w-full"
								required
							/>
						</div>
						<Button type="submit" className="w-full bg-primary text-primary-foreground">
							Submit
						</Button>
					</form>
				</CardContent>
			</Card>
			<Toaster />
		</div>
    )
}