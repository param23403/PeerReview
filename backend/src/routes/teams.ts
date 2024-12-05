import express, { Request, Response } from "express"
import multer from "multer"

const router = express.Router()

const upload = multer()

const createTeams = async (req: Request, res: Response): Promise<void> => {
	if (!req.file) {
		res.status(400).json({ message: "No file uploaded" })
		return
	}

	try {
		await new Promise((resolve) => setTimeout(resolve, 3000))

		res.status(201).json({ message: "Teams successfully created" })
	} catch (error) {
		console.error("Error simulating team creation:", error)
		res.status(500).json({ message: "Failed to create teams" })
	}
}

router.post("/create", upload.single("file"), createTeams)

export default router
