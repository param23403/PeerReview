import React, { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { toast } from "../../hooks/use-toast"
import { Toaster } from "../../components/ui/toaster"
import { useNavigate } from "react-router-dom"

export default function RemoveStudents() {
	const navigate = useNavigate()

	const [formData, setFormData] = useState({
		computingID: "",
	})

	const addStudentMutation = useMutation({
		mutationFn: async (data: typeof formData) => {
			const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/students/remove`, data, {
				headers: { "Content-Type": "application/json" },
			})
			return response.data
		},
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Student removed successfully!",
				variant: "success",
				duration: 2000,
			})
			setFormData({
				computingID: "",
			})

			setTimeout(() => {
				navigate("/professor-dashboard");
			}, 2000);
		},
		onError: (error: unknown) => {
			const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
				? error.response.data.message
				: "Unexpected error occurred."
			toast({
				title: "Error",
				description: errorMessage,
				variant: "destructive",
				duration: 3000,
			})
		},
	})

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault()
		const { computingID } = formData
		if (!computingID) {
			toast({
				title: "Error",
				description: "Please fill out all required fields.",
				variant: "destructive",
				duration: 3000,
			})
			return
		}
		addStudentMutation.mutate(formData)
	}

	const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = event.target
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}))
	}

	return (
		<div className="bg-background text-foreground flex flex-col items-center py-12">
			<Card className="w-full max-w-2xl p-6">
				<Label htmlFor="removeStudentForm" className="block text-lg font-semibold mb-4">
					Remove Student
				</Label>
				<form onSubmit={handleSubmit} id="removeStudentForm">
					<Input name="computingID" placeholder="Computing ID" value={formData.computingID} onChange={handleChange} className="mb-4" />
					<div className="flex justify-center items-center h-full">
						<Button type="submit" className="ce">
							Delete
						</Button>
					</div>
				</form>
			</Card>
			<Toaster />
		</div>
	)
}
