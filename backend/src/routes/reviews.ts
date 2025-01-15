import express, { Request, Response } from "express"
import { CollectionReference, Query, DocumentData } from "firebase-admin/firestore"
import { db } from "../../netlify/functions/firebase"

const router = express.Router()

const fetchStudentData = async (studentIds: string[]): Promise<Map<string, any>> => {
	const batchSize = 30 // Firestore's `in` query limit
	const studentData = new Map()

	for (let i = 0; i < studentIds.length; i += batchSize) {
		const batchIds = studentIds.slice(i, i + batchSize)

		const studentsSnapshot = await db.collection("students").where("__name__", "in", batchIds).get()

		studentsSnapshot.docs.forEach((doc) => {
			studentData.set(doc.id, doc.data())
		})
	}

	return studentData
}

const getReviews = async (req: Request, res: Response): Promise<void> => {
	const { search = "", sprintId = "", page = 1, limit = 20 } = req.query

	const searchTerm = search.toString().toLowerCase()
	const pageNumber = parseInt(page.toString(), 10)
	const pageSize = parseInt(limit.toString(), 10)

	try {
		const reviewsRef: CollectionReference<DocumentData> = db.collection("reviews") as CollectionReference<DocumentData>
		let query: Query<DocumentData> = reviewsRef

		if (sprintId) {
			query = query.where("sprintId", "==", sprintId)
		}

		const reviewsSnapshot = await query.limit(500).get()

		if (reviewsSnapshot.empty) {
			res.status(200).json({
				reviews: [],
				hasNextPage: false,
			})
			return
		}

		const reviews = reviewsSnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}))

		const studentIds = [...new Set(reviews.flatMap((review: any) => [review.reviewerId, review.reviewedTeammateId]))]

		const studentData = await fetchStudentData(studentIds)

		const enrichedReviews = reviews.map((review: any) => ({
			...review,
			reviewerName: studentData.get(review.reviewerId)?.name || "Unknown",
			revieweeName: studentData.get(review.reviewedTeammateId)?.name || "Unknown",
			reviewerTeam: studentData.get(review.reviewerId)?.team || "Unassigned",
			revieweeTeam: studentData.get(review.reviewedTeammateId)?.team || "Unassigned",
		}))

		const filteredReviews = enrichedReviews.filter(
			(review) => review.reviewerName.toLowerCase().includes(searchTerm) || review.revieweeName.toLowerCase().includes(searchTerm)
		)

		const paginatedReviews = filteredReviews.slice((pageNumber - 1) * pageSize, pageNumber * pageSize)

		const hasNextPage = pageNumber * pageSize < filteredReviews.length

		res.status(200).json({
			reviews: paginatedReviews,
			hasNextPage,
			nextPage: hasNextPage ? pageNumber + 1 : null,
		})
	} catch (error) {
		console.error("Error fetching reviews:", error)
		res.status(500).json({ message: "Failed to fetch reviews" })
	}
}

router.get("/search", getReviews)

export default router
