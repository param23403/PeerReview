import express, { Request, Response } from "express"
import multer from "multer"
import csvParser from "csv-parser"
import { Readable } from "stream"
import { db } from "../../netlify/functions/firebase";

const router = express.Router()
const upload = multer()

const saveTeams = async (students: any[]) => {
    try {
    	const batch = db.batch()

        const teamsMap = students.reduce((acc, student) => {
            if (!acc[student.team]) {
                acc[student.team] = [];
            }
            acc[student.team].push(student);
            return acc;
        }, {});

        Object.keys(teamsMap).forEach((teamID) => {
            const teamRef = db.collection("teams").doc(teamID);
            batch.set(teamRef, { students: teamsMap[teamID] });
        });

        await batch.commit()
        console.log("Teams successfully saved")
    } catch (error) {
        console.error("Error saving to Firebase:", error)
    }
}

const createTeams = async (req: Request, res: Response): Promise<void> => {
	if (!req.file) {
		res.status(400).json({ message: "No file uploaded" })
		return
	}

	//Parse CSV
	try {
        const fileStream = new Readable()
        fileStream.push(req.file.buffer)
        fileStream.push(null) 

        const students: any[] = []

        fileStream
            .pipe(csvParser())
            .on("data", (data) => {
				students.push({
                    team: data["Team"],
                    computingID: data["Computing ID"],
                    lastName: data["Last Name"],
                    firstName: data["First Name"],
                    preferredPronouns: data["Preferred Pronouns"],
                    githubID: data["GitHub ID"],
                    discordID: data["Discord ID"],
                });
			})
            .on("end", async () => {
                console.log("Parsed CSV data:", students)

				await saveTeams(students);
                res.status(201).json({ message: "Teams successfully created" });
            })
            .on("error", (err) => {
                console.error("Error parsing CSV:", err)
                res.status(500).json({ message: "Failed to parse file" })
            })
    } catch (error) {
        console.error("Error occurred. Please try again.", error)
        res.status(500).json({ message: "Error parsing or saving file to firebase. Please try again." })
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
            ...doc.data()
        }))

        res.status(200).json(teams)
    } catch (error) {
        console.error("Error fetching teams: ", error)
        res.status(500).json({ message: "Failed to fetch teams" })
    }
}

const getTeam = async (req: Request, res: Response): Promise<void> => {
    const { teamID } = req.params; 

    try {
        const teamRef = db.collection("teams").doc(teamID);
        const teamDoc = await teamRef.get();

        if (!teamDoc.exists) {
            res.status(404).json({ message: "Team not found" });
            return
        }

        res.status(200).json({
            id: teamDoc.id,
            ...teamDoc.data(),
        });
    } catch (error) {
        console.error("Error fetching team by ID: ", error);
        res.status(500).json({ message: "Failed to fetch team" });
    }
}

router.post("/createTeams", upload.single("file"), createTeams)
router.get("/getTeams", getTeams)
router.get("/getTeam/:teamID", getTeam)

export default router
