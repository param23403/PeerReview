import React, { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { toast } from "../hooks/use-toast"
import { Toaster } from "./ui/toaster"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog"
import api from "../api"

export default function RemoveStudent() {
	const [computingID, setComputingID] = useState("")
	const [isDialogOpen, setIsDialogOpen] = useState(false)

	const mutation = useMutation({
		mutationFn: async () => {
			const response = await api.post(
				"/students/remove",
				{ computingID },
				{
					headers: { "Content-Type": "application/json" },
				}
			)
			return response.data
		},
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Student removed successfully!",
				variant: "success",
				duration: 2000,
			})
			setComputingID("")
			setIsDialogOpen(false)
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
		if (!computingID) {
			toast({
				title: "Error",
				description: "Please enter a Computing ID.",
				variant: "destructive",
				duration: 3000,
			})
			return
		}
		setIsDialogOpen(true)
	}

	const handleConfirmDelete = () => {
		mutation.mutate()
	}

	return (
		<>
			<Card className="w-full max-w-3xl p-6">
				<Label htmlFor="removeStudentForm" className="block text-lg font-semibold mb-4">
					Remove Student
				</Label>
				<form onSubmit={handleSubmit} id="removeStudentForm">
					<Input
						name="computingID"
						placeholder="Computing ID"
						value={computingID}
						onChange={(e) => setComputingID(e.target.value)}
						className="mb-4"
					/>
					<Button type="submit" variant="destructive">
						Delete
					</Button>
				</form>
			</Card>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Deletion</DialogTitle>
						<DialogDescription>
							Are you sure you want to remove the student with Computing ID <span className="font-bold">{computingID}</span>? This action cannot
							be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDialogOpen(false)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleConfirmDelete} disabled={mutation.isPending}>
							{mutation.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Toaster />
		</>
	)
}
