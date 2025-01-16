import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import ReviewCard from "../../components/ReviewCard"
import Spinner from "../../components/Spinner"
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "../../components/ui/pagination"

const fetchReviews = async ({ searchTerm, sprintId, page }: { searchTerm: string; sprintId: string; page: number }) => {
	const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/reviews/search`, {
		params: { search: searchTerm, sprintId, page, limit: 15 },
	})
	return response.data
}

const Reviews = () => {
	const [searchTerm, setSearchTerm] = useState("")
	const [debouncedSearch, setDebouncedSearch] = useState(searchTerm)

	const location = useLocation()
	const queryParams = new URLSearchParams(location.search)
	const page = parseInt(queryParams.get("page") || "1", 10)
	const selectedSprint = queryParams.get("sprint") || ""
	const navigate = useNavigate()

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(searchTerm), 200)
		return () => clearTimeout(timer)
	}, [searchTerm])

	const { data, error, isLoading, isSuccess, isError } = useQuery({
		queryKey: ["reviews", debouncedSearch, selectedSprint, page],
		queryFn: () =>
			fetchReviews({
				searchTerm: debouncedSearch,
				sprintId: selectedSprint,
				page,
			}),
	})

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-3xl font-bold mb-4 text-primary">Review Search</h1>

			<div className="mb-6 flex gap-4">
				<Input
					type="text"
					placeholder="Search by reviewer or reviewee..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full p-2 border border-input rounded-md"
				/>
				<Select
					value={selectedSprint}
					onValueChange={(value) => {
						if (value === "all") {
							navigate(`?page=1&search=&sprint=`)
						} else {
							navigate(`?page=1&search=&sprint=${value}`)
						}
					}}
				>
					<SelectTrigger className="w-48">
						<SelectValue placeholder="All Sprints" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Sprints</SelectItem>
						<SelectItem value="1">Sprint 1</SelectItem>
						<SelectItem value="2">Sprint 2</SelectItem>
						{/* Add other sprint options dynamically */}
					</SelectContent>
				</Select>
			</div>

			{isError && <div className="text-destructive-foreground">Error: {error instanceof Error ? error.message : "Failed to fetch reviews"}</div>}

			<div className="space-y-4">
				{isLoading ? (
					<Spinner />
				) : (
					isSuccess &&
					data.reviews.map((review: any) => (
						<ReviewCard
							key={review.id}
							reviewerName={review.reviewerName}
							revieweeName={review.revieweeName}
							team={review.team}
							sprintId={review.sprintId}
							redFlag={review.redFlag}
						/>
					))
				)}
			</div>

			{/* Pagination Controls */}
			<div className="mt-6 flex justify-center">
				<Pagination>
					<PaginationContent>
						{page !== 1 && (
							<PaginationItem>
								<PaginationPrevious href={`?page=${page - 1}&search=${searchTerm}&sprint=${selectedSprint}`}>Previous</PaginationPrevious>
							</PaginationItem>
						)}
						{Array.from({ length: page + (data?.hasNextPage ? 1 : 0) }).map((_, idx) => (
							<PaginationItem key={idx}>
								<PaginationLink href={`?page=${idx + 1}&search=${searchTerm}&sprint=${selectedSprint}`} isActive={idx + 1 === page}>
									{idx + 1}
								</PaginationLink>
							</PaginationItem>
						))}
						{data?.hasNextPage && (
							<PaginationItem>
								<PaginationNext href={`?page=${page + 1}&search=${searchTerm}&sprint=${selectedSprint}`}>Next</PaginationNext>
							</PaginationItem>
						)}
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	)
}

export default Reviews
