import React, { useState, useEffect, useRef } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import axios from "axios"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import ReviewCard from "../../components/ReviewCard"
import Spinner from "../../components/Spinner"

const fetchReviews = async ({ queryKey, pageParam = 1 }: { queryKey: any; pageParam?: number }) => {
	const [_key, searchTerm, sprintId] = queryKey
	const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/reviews/search`, {
		params: { search: searchTerm, sprintId, page: pageParam, limit: 15 },
	})
	return response.data
}

const Reviews = () => {
	const [searchTerm, setSearchTerm] = useState("")
	const [debouncedSearch, setDebouncedSearch] = useState(searchTerm)
	const [selectedSprint, setSelectedSprint] = useState("")
	const observerRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(searchTerm), 200)
		return () => clearTimeout(timer)
	}, [searchTerm])

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = useInfiniteQuery({
		queryKey: ["reviews", debouncedSearch, selectedSprint],
		queryFn: fetchReviews,
		getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextPage : undefined),
		initialPageParam: 1,
	})

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage) {
					fetchNextPage()
				}
			},
			{ threshold: 1.0 }
		)

		if (observerRef.current) {
			observer.observe(observerRef.current)
		}

		return () => observer.disconnect()
	}, [fetchNextPage, hasNextPage])

    console.info(data)

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
				<Select value={selectedSprint} onValueChange={(value) => setSelectedSprint(value)}>
					<SelectTrigger className="w-48">
						<SelectValue placeholder="All Sprints" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Sprints</SelectItem>
						<SelectItem value="sprint1">Sprint 1</SelectItem>
						<SelectItem value="sprint2">Sprint 2</SelectItem>
						{/* Add other sprint options dynamically */}
					</SelectContent>
				</Select>
			</div>

			{isError && <div className="text-destructive-foreground">Error: {error instanceof Error ? error.message : "Failed to fetch reviews"}</div>}

			<div className="space-y-4">
				{isLoading
					? Array.from({ length: 5 }).map((_, index) => <ReviewCard key={index} loading />)
					: data?.pages.map((page, i) => (
							<React.Fragment key={i}>
								{page.reviews.map((review: any) => (
									<ReviewCard
										key={review.id}
										reviewerName={review.reviewerName}
										revieweeName={review.revieweeName}
										team={review.team}
										sprintId={review.sprintId}
										redFlag={review.redFlag}
									/>
								))}
							</React.Fragment>
					  ))}
			</div>

			{isFetchingNextPage && (
				<div className="flex justify-center mt-4">
					<Spinner />
				</div>
			)}

			<div ref={observerRef} className="h-1"></div>
		</div>
	)
}

export default Reviews
