import { useParams } from "react-router-dom"
import { useAuth } from "../../auth/useAuth"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "../../components/ui/button"
import { Calendar } from "../../components/ui/calendar"
import { Toaster } from "../../components/ui/toaster"
import { toast } from "../../hooks/use-toast"
import api from "../../api"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { useEffect } from "react"
import BackButton from "../../components/BackButton"

interface SprintData {
	name: string
	reviewDueDate: Date
	sprintDueDate: Date
}

export default function EditSprint() {
	const { sprintId } = useParams<{ sprintId: string }>()
	const { loading: authLoading } = useAuth()
	const queryClient = useQueryClient()

	const { control, handleSubmit, reset } = useForm({
		defaultValues: {
			name: "",
			reviewDueDate: undefined as Date | undefined,
			sprintDueDate: undefined as Date | undefined,
		},
	})

	const {
		data: sprint,
		error,
		isLoading,
	} = useQuery({
		queryKey: ["sprint", sprintId],
		queryFn: async () => {
			const response = await api.get(`/sprints/getSprint/${sprintId}`)
			return {
				name: response.data.name,
				reviewDueDate: new Date(response.data.reviewDueDate?._seconds * 1000 || Date.now()),
				sprintDueDate: new Date(response.data.sprintDueDate?._seconds * 1000 || Date.now()),
			}
		},
		enabled: !!sprintId && !authLoading,
	})

	useEffect(() => {
		if (sprint) {
			reset(sprint)
		}
	}, [sprint, reset])

	const updateSprintMutation = useMutation({
		mutationFn: async (data: { name: string; reviewDueDate?: Date; sprintDueDate?: Date }) => {
			const payload = { ...data, sprintId }
			return api.post("/sprints/updateSprint", payload)
		},
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Sprint updated successfully!",
				variant: "default",
			})
			queryClient.invalidateQueries({ queryKey: ["sprints"] })
		},
		onError: () => {
			toast({
				title: "Error",
				description: "Failed to save changes",
				variant: "destructive",
			})
		},
	})

	const onSubmit = (data: { name: string; reviewDueDate?: Date; sprintDueDate?: Date }) => {
		if (!data.name || !data.reviewDueDate || !data.sprintDueDate) {
			toast({
				title: "Error",
				description: "All fields are required.",
				variant: "destructive",
			})
			return
		}

		if (data.reviewDueDate <= data.sprintDueDate) {
			toast({
				title: "Error",
				description: "Review due date must be after sprint due date.",
				variant: "destructive",
			})
			return
		}

		updateSprintMutation.mutate(data)
	}

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<p>Loading sprint data...</p>
			</div>
		)
	}

	if (error) {
		return (
			<div className="flex justify-center items-center h-screen">
				<p className="text-destructive">Failed to load sprint data</p>
			</div>
		)
	}

	return (
		<div className="max-w-2xl mx-auto p-6">
			<BackButton useNavigateBack />
			<Card>
				<CardHeader>
					<CardTitle className="text-xl">Edit Sprint {sprintId}</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						<div>
							<label className="block text-sm font-medium mb-2">Sprint Name</label>
							<Controller name="name" control={control} render={({ field }) => <Input {...field} placeholder="Enter sprint name" />} />
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">Sprint Due Date</label>
							<Controller
								name="sprintDueDate"
								control={control}
								render={({ field }) => (
									<Popover>
										<PopoverTrigger asChild>
											<Button variant="outline" className="w-full justify-start text-left">
												<CalendarIcon className="mr-2 h-4 w-4" />
												{field.value ? format(field.value, "PPP") : <span>Pick a sprint due date</span>}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
										</PopoverContent>
									</Popover>
								)}
							/>
						</div>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-2">Review Due Date</label>
								<Controller
									name="reviewDueDate"
									control={control}
									render={({ field }) => (
										<Popover>
											<PopoverTrigger asChild>
												<Button variant="outline" className="w-full justify-start text-left">
													<CalendarIcon className="mr-2 h-4 w-4" />
													{field.value ? format(field.value, "PPP") : <span>Pick a review due date</span>}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
											</PopoverContent>
										</Popover>
									)}
								/>
							</div>
						</div>

						<Button type="submit" className="w-full">
							Save Changes
						</Button>
					</form>
				</CardContent>
			</Card>
			<Toaster />
		</div>
	)
}
