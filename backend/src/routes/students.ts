import express, { Request, Response } from "express"
import { db } from "../../netlify/functions/firebase"

const router = express.Router()

const searchStudents = async (req: Request, res: Response): Promise<void> => {
	const { search = "", page = 1, limit = 20 } = req.query

	const searchTerm = search.toString().toLowerCase()
	const pageNumber = parseInt(page.toString(), 10)
	const pageSize = parseInt(limit.toString(), 10)

	try {
		const studentsRef = db.collection("students")
		let query = studentsRef

		const snapshot = await query.limit(500).get()

		if (snapshot.empty) {
			res.status(200).json({
				students: [],
				hasNextPage: false,
			})
			return
		}

		const filteredStudents = snapshot.docs
			.map((doc) => ({ id: doc.id, ...doc.data() }))
			.filter((student: any) => student.name.toLowerCase().includes(searchTerm) || student.computingId.toLowerCase().includes(searchTerm))

		const paginatedStudents = filteredStudents.slice((pageNumber - 1) * pageSize, pageNumber * pageSize)

		const hasNextPage = pageNumber * pageSize < filteredStudents.length

		res.status(200).json({
			students: paginatedStudents,
			hasNextPage,
			nextPage: hasNextPage ? pageNumber + 1 : null,
		})
	} catch (error) {
		console.error("Error fetching students: ", error)
		res.status(500).json({ message: "Failed to fetch students" })
	}
}

const getStudent = async (req: Request, res: Response): Promise<void> => {
	const { studentID } = req.params

	try {
		const studentRef = db.collection("students").doc(studentID)
		const studentDoc = await studentRef.get()

		if (!studentDoc.exists) {
			res.status(404).json({ message: "Student not found" })
			return
		}

		res.status(200).json({
			id: studentDoc.id,
			...studentDoc.data(),
		})
	} catch (error) {
		console.error("Error fetching student: ", error)
		res.status(500).json({ message: "Failed to fetch student" })
	}
}

router.get("/search", searchStudents)
router.get("/getStudent/:studentID", getStudent)

export default router
