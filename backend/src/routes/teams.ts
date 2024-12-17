import express, { Request, Response } from "express"
import multer from "multer"
import csvParser from "csv-parser"
import { Readable } from "stream"
import { db } from "../../netlify/functions/firebase"

const router = express.Router()
const upload = multer()

const saveTeamsAndStudents = async (students: any[]) => {
	try {
		const batch = db.batch()

		const teamsMap = students.reduce((teams, student) => {
			if (!teams[student.team]) {
				teams[student.team] = []
			}
			teams[student.team].push(student)
			return teams
		}, {})

		Object.keys(teamsMap).forEach((teamID) => {
			const teamRef = db.collection("teams").doc(teamID)
			batch.set(teamRef, { students: teamsMap[teamID] })
		})

		students.forEach((student) => {
			const studentRef = db.collection("students").doc(student.computingID)
			batch.set(studentRef, {
				name: `${student.firstName} ${student.lastName}`,
				computingId: student.computingID,
				team: student.team,
				joinedAt: null,
				active: false,
				githubID: student.githubID || null,
				discordID: student.discordID || null,
				preferredPronouns: student.preferredPronouns || null,
			})
		})

		await batch.commit()
		console.log("Teams and students successfully saved")
	} catch (error) {
		console.error("Error saving to Firebase:", error)
		throw error
	}
}

const createTeams = async (req: Request, res: Response): Promise<void> => {
	console.log("Received request to /teams/create")

	if (!req.file) {
		console.error("No file uploaded")
		res.status(400).json({ message: "No file uploaded" })
		return
	}

	console.log("File received:", req.file.originalname)

	try {
		const fileStream = new Readable()
		fileStream.push(req.file.buffer)
		fileStream.push(null)

		const students: any[] = []

		fileStream
			.pipe(csvParser())
			.on("data", (data) => {
				console.log("Parsing row:", data) // Log each row for debugging
				students.push({
					team: data["Team"].split(" ").join("").split("-").join(""),
					computingID: data["Computing ID"],
					lastName: data["Last Name"],
					firstName: data["First Name"],
					preferredPronouns: data["Preferred Pronouns"],
					githubID: data["GitHub ID"],
					discordID: data["Discord ID"],
				})
			})
			.on("end", async () => {
				console.log("Parsed CSV data:", students)

				try {
					await saveTeamsAndStudents(students)
					console.log("Teams and students successfully saved")
					res.status(201).json({ message: "Teams and students successfully created" })
				} catch (saveError) {
					console.error("Error saving teams and students to Firebase:", saveError)
					res.status(500).json({ message: "Failed to save teams and students to Firebase" })
				}
			})
			.on("error", (parseError) => {
				console.error("Error parsing CSV:", parseError)
				res.status(500).json({ message: "Failed to parse file" })
			})
	} catch (error) {
		console.error("Unexpected error during file processing:", error)
		res.status(500).json({ message: "Unexpected error occurred. Please try again." })
	}
}

const getTeams = async (req: Request, res: Response): Promise<void> => {
	try {
		const snapshot = await db.collection("teams").get()

		if (snapshot.empty) {
			res.status(404).json({ message: "No teams found" })
			return
		}

		const teams = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}))

		res.status(200).json(teams)
	} catch (error) {
		console.error("Error fetching teams: ", error)
		res.status(500).json({ message: "Failed to fetch teams" })
	}
}

const getTeam = async (req: Request, res: Response): Promise<void> => {
	const { teamID } = req.params

	try {
		const teamRef = db.collection("teams").doc(teamID)
		const teamDoc = await teamRef.get()

		if (!teamDoc.exists) {
			res.status(404).json({ message: "Team not found" })
			return
		}

		res.status(200).json({
			id: teamDoc.id,
			...teamDoc.data(),
		})
	} catch (error) {
		console.error("Error fetching team by ID: ", error)
		res.status(500).json({ message: "Failed to fetch team" })
	}
}

router.post("/create", upload.single("file"), createTeams)
router.get("/getTeams", getTeams)
router.get("/getTeam/:teamID", getTeam)

export default router
