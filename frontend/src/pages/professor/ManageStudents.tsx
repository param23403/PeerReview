import React, { useState, useRef } from "react"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { toast } from "../../hooks/use-toast"
import { Toaster } from "../../components/ui/toaster"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Loader2 } from "lucide-react"
import api from "../../api"
import AddStudent from "../../components/AddStudent"
import RemoveStudent from "../../components/RemoveStudent"

export default function ManageStudents() {
	const [file, setFile] = useState<File | null>(null)
	const fileInputRef = useRef<HTMLInputElement | null>(null)

	const createTeamsMutation = useMutation({
		mutationFn: async (file: File) => {
			const formData = new FormData()
			formData.append("file", file)

			const response = await api.post("/teams/create", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			})
			return response.data
		},
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Teams created successfully!",
				variant: "success",
				duration: 3000,
			})
			setFile(null)
			if (fileInputRef.current) {
				fileInputRef.current.value = ""
			}
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

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault()
		if (file) {
			createTeamsMutation.mutate(file)
		} else {
			toast({
				title: "Error",
				description: "Please select a CSV file before submitting.",
				variant: "destructive",
				duration: 3000,
			})
		}
	}

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0] || null
		setFile(selectedFile)
	}

	return (
		<div className="bg-background text-foreground flex flex-col py-12">
			<div className="container w-full max-w-3xl mx-auto">
				<h1 className="text-2xl font-bold mb-4">Manage Students</h1>

				<Tabs defaultValue="upload" className="w-full">
					<TabsList className="mx-auto justify-center space-x-4 mb-4">
						<TabsTrigger value="upload">Upload CSV</TabsTrigger>
						<TabsTrigger value="add">Add Student</TabsTrigger>
						<TabsTrigger value="remove">Remove Student</TabsTrigger>
					</TabsList>

					{/* Upload CSV Tab */}
					<TabsContent value="upload">
						<Card className="p-6">
							<Label htmlFor="fileUpload" className="block text-lg font-semibold mb-4">
								Upload Team Assignments CSV
							</Label>
							<form onSubmit={handleSubmit}>
								<Input id="fileUpload" type="file" accept=".csv" onChange={handleFileChange} className="mb-4" ref={fileInputRef} />
								<Button type="submit" disabled={createTeamsMutation.isPending || !file}>
									{createTeamsMutation.isPending ? (
										<>
											<Loader2 className="animate-spin mr-2" />
											Creating Teams...
										</>
									) : (
										"Create Teams"
									)}
								</Button>
							</form>
						</Card>
					</TabsContent>

					{/* Add Student Tab */}
					<TabsContent value="add">
						<AddStudent />
					</TabsContent>

					{/* Remove Student Tab */}
					<TabsContent value="remove">
						<RemoveStudent />
					</TabsContent>
				</Tabs>
			</div>
			<Toaster />
		</div>
	)
}
