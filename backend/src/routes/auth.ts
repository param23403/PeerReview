import express, { Request, Response } from "express"
import { db } from "../../netlify/functions/firebase"

const router = express.Router()

const getUserData = async (req: Request, res: Response): Promise<void> => {
	const { uid } = req.params

	if (!uid) {
		res.status(400).send({ message: "Missing user ID in request" })
		return
	}

	try {
		const userDocRef = db.doc(`users/${uid}`)
		const userDoc = await userDocRef.get()

		if (!userDoc.exists) {
			res.status(404).send({ message: "User data not found" })
			return
		}

		res.status(200).json(userDoc.data())
	} catch (error) {
		console.error("Error fetching user data:", error)
		res.status(500).send({ message: "Failed to fetch user data" })
	}
}

const addUserToFirestore = async (req: Request, res: Response): Promise<void> => {
	const { uid, firstName, lastName, computingId, email } = req.body

	if (!uid || !firstName || !lastName || !computingId || !email) {
		res.status(400).json({ message: "Missing required fields" })
		return
	}

	try {
		const userDocRef = db.doc(`users/${uid}`)
		await userDocRef.set({
			firstName,
			lastName,
			computingId,
			email,
			role: "student",
			createdAt: new Date(),
		})

		res.status(201).json({ message: "User data successfully added to Firestore" })
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error"
		res.status(500).json({
			message: "An unexpected error occurred",
			error: errorMessage,
		})
		console.error("Error adding user data to Firestore:", error)
	}
}

router.get("/getUser/:uid", getUserData)
router.post("/addUser", addUserToFirestore)

export default router
