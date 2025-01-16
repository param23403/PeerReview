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

		const snapshot = await query.get()

		if (snapshot.empty) {
			res.status(200).json({
				students: [],
				hasNextPage: false,
				total: 0,
			})
			return
		}

		const filteredStudents = snapshot.docs
			.map((doc) => ({ id: doc.id, ...doc.data() }))
			.filter((student: any) => student.name.toLowerCase().includes(searchTerm) || student.computingId.toLowerCase().includes(searchTerm))

		const total = filteredStudents.length
		const paginatedStudents = filteredStudents.slice((pageNumber - 1) * pageSize, pageNumber * pageSize)

		const hasNextPage = pageNumber * pageSize < total

		res.status(200).json({
			students: paginatedStudents,
			hasNextPage,
			total,
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

const addStudent = async (req: Request, res: Response): Promise<void> => {
    const { team, firstName, lastName, computingID, preferredPronouns, githubID, discordID } = req.body

    console.log("Received student data:", req.body)

    try {
        const studentsRef = db.collection("students")
        const snapshot = await studentsRef.get()
        const studentCount = snapshot.size
        
        const newStudentID = studentCount

        await studentsRef.doc(newStudentID.toString()).set({
			id: computingID,
            name: `${firstName} ${lastName}`,
            computingID,
			team,
			joinedAt: new Date().toISOString(),
            active: false,
            githubID,
            discordID,
            preferredPronouns,
        });

        res.status(201).json({ message: "Student added successfully" })
    } catch (error) {
        console.error("Error adding student:", error)
        res.status(500).json({ message: "Failed to add student" })
    }
}

const removeStudent = async (req: Request, res: Response): Promise<void> => {
    const { computingID } = req.body

    try {
        const studentsRef = db.collection("students")
        const snapshot = await studentsRef.where("computingID", "==", computingID).get()

        if (snapshot.empty) {
            console.log("No matching student found.");
            res.status(404).json({ message: "Student not found" })
            return
        }

        snapshot.forEach(async (doc) => {
            await studentsRef.doc(doc.id).delete();
        })

        res.status(200).json({ message: "Student removed successfully" })
    } catch (error) {
        console.error("Error removing student:", error);
        res.status(500).json({ message: "Failed to remove student" })
    }
}

router.post("/add", addStudent)
router.post("/remove", removeStudent)
router.get("/search", searchStudents)
router.get("/getStudent/:studentID", getStudent)
 
export default router
