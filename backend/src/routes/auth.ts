import express, { Request, Response } from "express";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../netlify/functions/firebase";

const router = express.Router();

const addUserToFirestore = async (req: Request, res: Response): Promise<void> => {
    try {
        const { uid, firstName, lastName, computingId, email } = req.body;

        if (!uid || !firstName || !lastName || !computingId || !email) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        await setDoc(doc(db, "users", uid), {
            firstName,
            lastName,
            computingId,
            email,
            role: "student",
            createdAt: new Date(),
        });

        res.status(201).json({ message: "User data successfully added to Firestore" });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
            message: "Failed to update Firestore",
            error: errorMessage,
        });
        console.error("Error updating Firestore:", error);
    }
};

router.post("/addUser", addUserToFirestore);

export default router;
