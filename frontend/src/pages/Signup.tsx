import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { auth } from "../firebase"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { createUserWithEmailAndPassword, deleteUser, updateProfile, UserCredential } from "firebase/auth"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { toast } from "../hooks/use-toast"
import { Toaster } from "../components/ui/toaster"
import { FirebaseError } from "firebase/app"
import { getFirebaseErrorMessage } from "../lib/utils"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import api from "../api"

interface SignUpFormData {
	firstName: string
	lastName: string
	computingId: string
	email: string
	password: string
	confirmPassword: string
}

export default function SignUp() {
	const [formData, setFormData] = useState<SignUpFormData>({
		firstName: "",
		lastName: "",
		computingId: "",
		email: "",
		password: "",
		confirmPassword: "",
	})
	const [showPassword, setShowPassword] = useState<boolean>(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
	const navigate = useNavigate()

	const addUserToFirestore = useMutation({
		mutationFn: async (userData: { uid: string; firstName: string; lastName: string; computingId: string; email: string }) => {
			const response = await api.post("/auth/addUser", userData, {
				headers: { "Skip-Auth": "true" },
			})
			return response.data
		},
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Account created successfully!",
				variant: "success",
				duration: 3000,
			})
			navigate("/login")
		},
		// onError: (error: unknown) => {
		// 	const errorMessage = axios.isAxiosError(error) && error.response?.data?.message ? error.response.data.message : "Unexpected error occurred."
		// 	toast({
		// 		title: "Error",
		// 		description: errorMessage,
		// 		variant: "destructive",
		// 		duration: 3000,
		// 	})
		// 	console.error("Error during Firestore update:", error)
		// },
	})

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.target
		setFormData((prev) => ({
			...prev,
			[id]: value,
		}))
	}

	const togglePasswordVisibility = () => setShowPassword((prev) => !prev)
	const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev)

	const validateForm = (): boolean => {
		if (formData.password !== formData.confirmPassword) {
			toast({
				title: "Error",
				description: "Passwords do not match",
				variant: "destructive",
				duration: 3000,
			})
			return false
		}
		if (formData.email !== `${formData.computingId}@virginia.edu`) {
			toast({
				title: "Error",
				description: "Email should be in the format <computing_id>@virginia.edu",
				variant: "destructive",
				duration: 3000,
			})
			return false
		}
		return true
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!validateForm()) {
			return
		}

		let userCredential: UserCredential | null = null

		try {
			userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
			const { uid } = userCredential.user

			await updateProfile(userCredential.user, {
				displayName: `${formData.firstName} ${formData.lastName}`,
			})

			await addUserToFirestore.mutateAsync({
				uid,
				firstName: formData.firstName,
				lastName: formData.lastName,
				computingId: formData.computingId,
				email: formData.email,
			})

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
				const errorMessage = axios.isAxiosError(error) && error.response?.data?.message ? error.response.data.message : "Unexpected error occurred."
				toast({
					title: "Error",
					description: errorMessage,
					variant: "destructive",
					duration: 3000,
				})
			}

			console.error("Error during sign-up:", error)

			if (userCredential) {
				await deleteUser(userCredential.user)
			}
		}
	}

	return (
		<div className="flex items-center justify-center bg-background text-foreground">
			<Card className="w-full max-w-lg shadow-md border border-muted">
				<CardHeader>
					<CardTitle className="text-center text-xl font-semibold">Sign Up</CardTitle>
					<CardDescription className="text-center text-muted-foreground">Create your account to get started</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<Label htmlFor="firstName" className="block mb-1 text-sm font-medium">
								First Name
							</Label>
							<Input
								id="firstName"
								type="text"
								placeholder="Enter your first name"
								value={formData.firstName}
								onChange={handleInputChange}
								required
								className="block w-full"
							/>
						</div>
						<div>
							<Label htmlFor="lastName" className="block mb-1 text-sm font-medium">
								Last Name
							</Label>
							<Input
								id="lastName"
								type="text"
								placeholder="Enter your last name"
								value={formData.lastName}
								onChange={handleInputChange}
								required
								className="block w-full"
							/>
						</div>
						<div>
							<Label htmlFor="computingId" className="block mb-1 text-sm font-medium">
								Computing ID
							</Label>
							<Input
								id="computingId"
								type="text"
								placeholder="Enter your computing ID"
								value={formData.computingId}
								onChange={handleInputChange}
								required
								className="block w-full"
							/>
						</div>
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
								required
								className="block w-full"
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
									required
									className="block w-full"
								/>
								<span className="absolute inset-y-0 right-3 flex items-center cursor-pointer" onClick={togglePasswordVisibility}>
									{showPassword ? <FaEyeSlash className="text-primary" /> : <FaEye className="text-primary" />}
								</span>
							</div>
						</div>
						<div>
							<Label htmlFor="confirmPassword" className="block mb-1 text-sm font-medium">
								Confirm Password
							</Label>
							<div className="relative">
								<Input
									id="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									placeholder="Confirm your password"
									value={formData.confirmPassword}
									onChange={handleInputChange}
									required
									className="block w-full"
								/>
								<span className="absolute inset-y-0 right-3 flex items-center cursor-pointer" onClick={toggleConfirmPasswordVisibility}>
									{showConfirmPassword ? <FaEyeSlash className="text-primary" /> : <FaEye className="text-primary" />}
								</span>
							</div>
						</div>
						<Button type="submit" className="w-full bg-primary text-primary-foreground">
							Sign Up
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex justify-center">
					<Button variant="link" onClick={() => navigate("/login")} className="text-sm text-muted-foreground">
						Already have an account? Login.
					</Button>
				</CardFooter>
			</Card>
			<Toaster />
		</div>
	)
}
