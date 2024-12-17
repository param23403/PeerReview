import React, { useState, useEffect, useRef } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import axios from "axios"
import { Input } from "../../components/ui/input"
import StudentCard from "../../components/StudentCard"
import Spinner from "../../components/Spinner"

const fetchStudents = async ({ queryKey, pageParam = 1 }) => {
	const [_key, searchTerm] = queryKey
	const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/students/search`, { params: { search: searchTerm, page: pageParam, limit: 20 } })
	return response.data
}

const Students = () => {
	const [searchTerm, setSearchTerm] = useState("")
	const [debouncedSearch, setDebouncedSearch] = useState(searchTerm)
	const observerRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchTerm)
		}, 200)
		return () => clearTimeout(timer)
	}, [searchTerm])

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = useInfiniteQuery({
		queryKey: ["students", debouncedSearch],
		queryFn: fetchStudents,
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

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-3xl font-bold mb-4 text-primary">Student Search</h1>

			{/* Search Input */}
			<div className="mb-6">
				<Input
					type="text"
					placeholder="Search for students..."
					value={searchTerm}
					onChange={(e: { target: { value: React.SetStateAction<string> } }) => setSearchTerm(e.target.value)}
					className="w-full p-2 border border-gray-300 rounded-md"
				/>
			</div>

			{isError && <div className="text-destructive-foreground">Error: {error instanceof Error ? error.message : "Failed to fetch students"}</div>}

			<div className="space-y-4">
				{isLoading
					? Array.from({ length: 5 }).map((_, index) => <StudentCard key={index} loading />)
					: data?.pages.map((page, i) => (
							<React.Fragment key={i}>
								{page.students.map((student: any) => (
									<StudentCard
										key={student.id}
										name={student.name}
										computingId={student.computingId}
										team={student.team}
										githubId={student.githubID}
										discordId={student.discordID}
										active={student.active}
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

export default Students
