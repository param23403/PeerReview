import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../firebase"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { useAuth } from "../auth/useAuth"
import { FaEye, FaEyeSlash } from "react-icons/fa"

interface LoginFormData {
	email: string
	password: string
}

export default function Login() {
	const navigate = useNavigate()
	const { user } = useAuth()

	const [formData, setFormData] = useState<LoginFormData>({
		email: "",
		password: "",
	})
	const [showPassword, setShowPassword] = useState<boolean>(false)
	const [error, setError] = useState<string>("")

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.target
		setFormData((prev) => ({
			...prev,
			[id]: value,
		}))
	}

	const togglePasswordVisibility = () => setShowPassword((prev) => !prev)

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError("")

		try {
			await signInWithEmailAndPassword(auth, formData.email, formData.password)
			console.log("User logged in successfully")
			navigate("/dashboard")
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message)
			} else {
				setError("An unexpected error occurred")
			}
			console.error("Error logging in:", error)
		}
	}

	if (user) {
		navigate("/dashboard")
		return null
	}

	return (
		<div className="container mx-auto flex items-center justify-center bg-background text-foreground">
			<Card className="w-full max-w-lg shadow-md border border-muted">
				<CardHeader>
					<CardTitle className="text-center text-xl font-semibold">Login</CardTitle>
					<CardDescription className="text-center text-muted-foreground">Enter your credentials to access your account</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<Label htmlFor="email" className="block mb-1 text-sm font-medium">
								Email
							</Label>
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								value={formData.email}
								onChange={handleInputChange}
								className="block w-full"
								required
							/>
						</div>
						<div>
							<Label htmlFor="password" className="block mb-1 text-sm font-medium">
								Password
							</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="Enter your password"
									value={formData.password}
									onChange={handleInputChange}
									className="block w-full"
									required
								/>
								<span className="absolute inset-y-0 right-3 flex items-center cursor-pointer" onClick={togglePasswordVisibility}>
									{showPassword ? <FaEyeSlash /> : <FaEye />}
								</span>
							</div>
						</div>
						{error && <div className="text-destructive text-sm text-center">{error}</div>}
						<Button type="submit" className="w-full bg-primary text-primary-foreground">
							Login
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex flex-col">
					<Button type="button" variant="link" className="text-sm text-muted-foreground">
						Forgot Password?
					</Button>
					<Button variant="link" onClick={() => navigate("/signup")} className="text-sm text-muted-foreground">
						Don't have an account? Signup.
					</Button>
				</CardFooter>
			</Card>
		</div>
	)
}
