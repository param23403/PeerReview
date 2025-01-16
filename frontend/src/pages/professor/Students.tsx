import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"
import axios from "axios"
import { Input } from "../../components/ui/input"
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

const fetchStudents = async ({ searchTerm, page, limit }: { searchTerm: string; page: number; limit: number }) => {
	const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/students/search`, {
		params: { search: searchTerm, page, limit },
	})
	return response.data
}

const Students = () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const [limit] = useState(20)

	const searchTerm = searchParams.get("search") || ""
	const page = parseInt(searchParams.get("page") || "1", 10)

	const [debouncedSearch, setDebouncedSearch] = useState(searchTerm)

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(searchTerm), 200)
		return () => clearTimeout(timer)
	}, [searchTerm])

	const { data, error, isLoading, isError } = useQuery({
		queryKey: ["students", debouncedSearch, page, limit],
		queryFn: () => fetchStudents({ searchTerm: debouncedSearch, page, limit }),
	})

	const totalPages = Math.ceil((data?.total || 0) / limit)

	const handleSearchChange = (value: string) => {
		setSearchParams({ search: value, page: "1" })
	}

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-3xl font-bold mb-4 text-primary">Student Search</h1>

			<div className="mb-6">
				<Input
					type="text"
					placeholder="Search by name or computing ID..."
					value={searchTerm}
					onChange={(e) => handleSearchChange(e.target.value)}
					className="w-full p-2"
				/>
			</div>

			{isError && <div className="text-destructive-foreground">Error: {error instanceof Error ? error.message : "Failed to fetch students"}</div>}

			<div className="overflow-x-auto">
				{isLoading ? (
					<Spinner />
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Computing ID</TableHead>
								<TableHead>Team</TableHead>
								<TableHead>GitHub ID</TableHead>
								<TableHead>Discord ID</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data?.students.map((student: any) => (
								<TableRow key={student.id}>
									<TableCell>{student.name}</TableCell>
									<TableCell>{student.computingId}</TableCell>
									<TableCell>{student.team || "Unassigned"}</TableCell>
									<TableCell>{student.githubId || "N/A"}</TableCell>
									<TableCell>{student.discordId || "N/A"}</TableCell>
									<TableCell>{student.active ? "Active" : "Not Active"}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</div>

			<div className="mt-6 flex justify-center">
				<Pagination>
					<PaginationContent>
						{page > 1 && (
							<PaginationItem>
								<PaginationPrevious href={`?search=${debouncedSearch}&page=${page - 1}`} />
							</PaginationItem>
						)}

						{Array.from({ length: totalPages })
							.map((_, idx) => idx + 1)
							.filter((pageNumber) => {
								if (pageNumber === 1 || pageNumber === totalPages || Math.abs(pageNumber - page) <= 1) {
									return true
								}
								return false
							})
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
										<PaginationLink href={`?search=${debouncedSearch}&page=${item}`} isActive={item === page}>
											{item}
										</PaginationLink>
									</PaginationItem>
								)
							)}

						{page < totalPages && (
							<PaginationItem>
								<PaginationNext href={`?search=${debouncedSearch}&page=${page + 1}`} />
							</PaginationItem>
						)}
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	)
}

export default Students
