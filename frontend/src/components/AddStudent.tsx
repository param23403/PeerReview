import React, { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { toast } from "../hooks/use-toast"
import { Toaster } from "./ui/toaster"
import api from "../api"

export default function AddStudent() {
	const queryClient = useQueryClient()
	const [formData, setFormData] = useState({
		team: "",
		firstName: "",
		lastName: "",
		computingID: "",
		preferredPronouns: "",
		githubID: "",
		discordID: "",
	})

	const mutation = useMutation({
		mutationFn: async (data: typeof formData) => {
			const response = await api.post("/students/add", data, {
				headers: { "Content-Type": "application/json" },
			})
			return response.data
		},
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Student added successfully!",
				variant: "success",
				duration: 2000,
			})
			setFormData({
				team: "",
				firstName: "",
				lastName: "",
				computingID: "",
				preferredPronouns: "",
				githubID: "",
				discordID: "",
			})
			queryClient.invalidateQueries({ queryKey: ["students"] })
		},
		onError: (error: unknown) => {
			const errorMessage = axios.isAxiosError(error) && error.response?.data?.message ? error.response.data.message : "Unexpected error occurred."
			toast({
				title: "Error",
				description: errorMessage,
				variant: "destructive",
				duration: 3000,
			})
		},
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!formData.team || !formData.firstName || !formData.lastName || !formData.computingID || !formData.githubID || !formData.discordID) {
			toast({
				title: "Error",
				description: "Please fill out all required fields.",
				variant: "destructive",
				duration: 3000,
			})
			return
		}
		mutation.mutate(formData)
	}

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	return (
		<>
			<Card className="w-full max-w-3xl p-6">
				<h2 className="text-lg font-semibold mb-4">Add Student</h2>
				<form onSubmit={handleSubmit} id="addStudentForm" className="space-y-4">
					{[
						{ name: "team", label: "Team" },
						{ name: "firstName", label: "First Name" },
						{ name: "lastName", label: "Last Name" },
						{ name: "computingID", label: "Computing ID" },
						{ name: "preferredPronouns", label: "Preferred Pronouns" },
						{ name: "githubID", label: "GitHub ID" },
						{ name: "discordID", label: "Discord ID" },
					].map(({ name, label }) => (
						<div key={name} className="space-y-1">
							<Label htmlFor={name} className="text-sm font-medium">
								{label}
							</Label>
							<Input
								id={name}
								name={name}
								placeholder={label}
								value={formData[name as keyof typeof formData]}
								onChange={handleChange}
								className="w-full"
							/>
						</div>
					))}
					<Button type="submit" className="mt-4">
						Save
					</Button>
				</form>
			</Card>
			<Toaster />
		</>
	)
}
