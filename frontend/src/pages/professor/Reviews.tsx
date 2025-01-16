import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"
import axios from "axios"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "../../components/ui/pagination"
import Spinner from "../../components/Spinner"

const fetchReviews = async ({ searchTerm, sprintId, page, limit }: { searchTerm: string; sprintId: string; page: number; limit: number }) => {
	const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/reviews/search`, {
		params: { search: searchTerm, sprintId, page, limit },
	})
	return response.data
}

const fetchSprints = async () => {
	const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/sprints/getSprints`)
	return response.data
}

const Reviews = () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const [limit] = useState(15)

	const searchTerm = searchParams.get("search") || ""
	const page = parseInt(searchParams.get("page") || "1", 10)
	const sprintId = searchParams.get("sprint") || ""

	const [debouncedSearch, setDebouncedSearch] = useState(searchTerm)

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(searchTerm), 200)
		return () => clearTimeout(timer)
	}, [searchTerm])

	const {
		data: reviewsData,
		error: reviewsError,
		isLoading: reviewsLoading,
		isError: reviewsIsError,
	} = useQuery({
		queryKey: ["reviews", debouncedSearch, sprintId, page, limit],
		queryFn: () => fetchReviews({ searchTerm: debouncedSearch, sprintId, page, limit }),
	})

	const { data: sprintsData, isLoading: sprintsLoading } = useQuery({
		queryKey: ["sprints"],
		queryFn: fetchSprints,
	})

	const totalPages = Math.ceil((reviewsData?.total || 0) / limit)

	const handleSearchChange = (value: string) => {
		setSearchParams({ search: value, page: "1", sprint: sprintId })
	}

	const handleSprintChange = (value: string) => {
		setSearchParams({ search: searchTerm, page: "1", sprint: value })
	}

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-3xl font-bold mb-4 text-primary">Review Search</h1>

			<div className="mb-6 flex gap-4">
				<Input
					type="text"
					placeholder="Search by reviewee name..."
					value={searchTerm}
					onChange={(e) => handleSearchChange(e.target.value)}
					className="w-full p-2 border"
				/>
				<Select value={sprintId} onValueChange={(value) => handleSprintChange(value)}>
					<SelectTrigger className="w-48">
						<SelectValue placeholder="All Sprints" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Sprints</SelectItem>
						{sprintsLoading ? (
							<SelectItem value="loading" disabled>
								Loading...
							</SelectItem>
						) : (
							sprintsData?.map((sprint: { id: string }) => (
								<SelectItem key={sprint.id} value={sprint.id}>
									Sprint {sprint.id}
								</SelectItem>
							))
						)}
					</SelectContent>
				</Select>
			</div>

			{reviewsIsError && (
				<div className="text-destructive-foreground">Error: {reviewsError instanceof Error ? reviewsError.message : "Failed to fetch reviews"}</div>
			)}

			<div className="overflow-x-auto">
				{reviewsLoading ? (
					<Spinner />
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Reviewee Name</TableHead>
								<TableHead>Reviewer Name</TableHead>
								<TableHead>Team</TableHead>
								<TableHead>Sprint</TableHead>
								<TableHead>Red Flag</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{reviewsData?.reviews.map((review: any) => (
								<TableRow key={review.id}>
									<TableCell>{review.revieweeName}</TableCell>
									<TableCell>{review.reviewerName}</TableCell>
									<TableCell>{review.team || "Unassigned"}</TableCell>
									<TableCell>{review.sprintId || "N/A"}</TableCell>
									<TableCell>{review.redFlag ? "Yes" : "No"}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</div>

			{/* Pagination */}
			<div className="mt-6 flex justify-center">
				<Pagination>
					<PaginationContent>
						{page > 1 && (
							<PaginationItem>
								<PaginationPrevious href={`?search=${searchTerm}&sprint=${sprintId}&page=${page - 1}`} />
							</PaginationItem>
						)}
						{Array.from({ length: totalPages })
							.map((_, idx) => idx + 1)
							.filter((pageNumber) => pageNumber === 1 || pageNumber === totalPages || Math.abs(pageNumber - page) <= 1)
							.reduce<(number | "ellipsis")[]>((acc, pageNumber, idx, array) => {
								if (idx > 0 && pageNumber !== array[idx - 1] + 1) {
									acc.push("ellipsis")
								}
								acc.push(pageNumber)
								return acc
							}, [])
							.map((item, idx) =>
								item === "ellipsis" ? (
									<PaginationItem key={`ellipsis-${idx}`}>
										<PaginationEllipsis />
									</PaginationItem>
								) : (
									<PaginationItem key={item}>
										<PaginationLink href={`?search=${searchTerm}&sprint=${sprintId}&page=${item}`} isActive={item === page}>
											{item}
										</PaginationLink>
									</PaginationItem>
								)
							)}
						{page < totalPages && (
							<PaginationItem>
								<PaginationNext href={`?search=${searchTerm}&sprint=${sprintId}&page=${page + 1}`} />
							</PaginationItem>
						)}
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	)
}

export default Reviews
