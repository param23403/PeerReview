import express, { Request, Response } from "express"
import admin from "firebase-admin"
import { db } from "../../netlify/functions/firebase"
import { authenticateUser } from "../../netlify/functions/middleware/auth"

const router = express.Router()

const searchStudents = async (req: Request, res: Response): Promise<void> => {
	const { search = "", page = 1, limit = 20 } = req.query

	const searchTerm = search.toString().toLowerCase().trim()
	const pageNumber = parseInt(page.toString(), 10)
	const pageSize = parseInt(limit.toString(), 10)

	try {
		const studentsRef = db.collection("students")
		const studentsSnapshot = await studentsRef.get()

		if (studentsSnapshot.empty) {
			res.status(200).json({
				students: [],
				hasNextPage: false,
				total: 0,
			})
			return
		}

		const filteredStudents = studentsSnapshot.docs
			.map((doc) => ({ id: doc.id, ...doc.data() }))
			.filter((student: any) => {
				return student.computingID?.toLowerCase().includes(searchTerm) || student.name?.toLowerCase().includes(searchTerm)
			})

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
	const { team, computingID, lastName, firstName, preferredPronouns, githubID, discordID } = req.body

	const name = `${firstName} ${lastName}`.trim()

	try {
		const studentsRef = db.collection("students")
		const studentDoc = await studentsRef.doc(computingID).get()

		if (studentDoc.exists) {
			res.status(409).json({ message: "Student with this Computing ID already exists." })
			return
		}

		await studentsRef.doc(computingID).set({
			team,
			computingID,
			name,
			preferredPronouns,
			githubID,
			discordID,
		})

		const teamRef = db.collection("teams").doc(team)
		const teamDoc = await teamRef.get()

		if (teamDoc.exists) {
			const currentStudents = teamDoc.data()?.students || []
			currentStudents.push({
				computingID,
				name,
				discordID,
				preferredPronouns,
				githubID,
				team,
			})

			await teamRef.update({ students: currentStudents })
		} else {
			await teamRef.set({
				name: team,
				students: [
					{
						computingID,
						name,
						discordID,
						preferredPronouns,
						githubID,
						team,
					},
				],
			})
		}

		res.status(201).json({ message: "Student added successfully" })
	} catch (error) {
		console.error("Error adding student:", error)
		res.status(500).json({ message: "Failed to add student" })
	}
}

const removeStudent = async (req: Request, res: Response): Promise<void> => {
	const { computingID } = req.body

	try {
		const [studentSnapshot, reviewsSnapshot, reviewedSnapshot, userSnapshot] = await Promise.all([
			db.collection("students").where("computingID", "==", computingID).get(),
			db.collection("reviews").where("reviewerId", "==", computingID).get(),
			db.collection("reviews").where("reviewedTeammateId", "==", computingID).get(),
			db.collection("users").where("studentId", "==", computingID).get(),
		])

		if (studentSnapshot.empty) {
			res.status(404).json({ message: "Student not found" })
			return
		}

		const batch = db.batch()
		let teamID = ""
		let studentName = ""
		let authUID = ""

		studentSnapshot.forEach((doc) => {
			const studentData = doc.data()
			teamID = studentData.team
			studentName = studentData.name
			batch.delete(doc.ref)
		})

		if (teamID) {
			const teamRef = db.collection("teams").doc(teamID)
			const teamDoc = await teamRef.get()

			if (teamDoc.exists) {
				const currentStudents = teamDoc.data()?.students || []
				const updatedStudents = currentStudents.filter((s: any) => s.computingID !== computingID)
				batch.update(teamRef, { students: updatedStudents })
			}
		}

		reviewsSnapshot.forEach((doc) => batch.delete(doc.ref))
		reviewedSnapshot.forEach((doc) => batch.delete(doc.ref))

		userSnapshot.forEach((doc) => {
			authUID = doc.id
			batch.delete(doc.ref)
		})

		await batch.commit()

		if (authUID) {
			await admin.auth().deleteUser(authUID)
		}

		res.status(200).json({ message: `Student ${studentName} removed successfully.` })
	} catch (error) {
		console.error("Error removing student:", error)
		res.status(500).json({ message: "Failed to remove student" })
	}
}

router.post("/add", authenticateUser, addStudent)
router.post("/remove", authenticateUser, removeStudent)
router.get("/search", authenticateUser, searchStudents)
router.get("/getStudent/:studentID", authenticateUser, getStudent)

export default router
