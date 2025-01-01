import React, { useState, useRef } from "react"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { toast } from "../../hooks/use-toast"
import { Toaster } from "../../components/ui/toaster"
import { To, useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"

export default function TeamCreation() {
	const [file, setFile] = useState<File | null>(null)
	const fileInputRef = useRef<HTMLInputElement | null>(null)

	const createTeamsMutation = useMutation({
		mutationFn: async (file: File) => {
			const formData = new FormData()
			formData.append("file", file)

			const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/teams/create`, formData, {
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

	const navigate = useNavigate();
	
	  const handleNavigation = (path: To) => {
		navigate(path);
	};

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
		<div className="bg-background text-foreground flex flex-col items-center py-12">
			<Card className="w-full max-w-2xl p-6">
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
			<div className="mt-20 space-x-20">
				<Button onClick={() => handleNavigation("/add-students")}>
					Add Students
				</Button>
				<Button onClick={() => handleNavigation("/remove-students")}>
					Remove Students
				</Button>
			</div>
			<Toaster />
		</div>
	)
}
