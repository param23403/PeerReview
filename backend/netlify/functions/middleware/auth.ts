import admin from "firebase-admin"
import { db } from "../firebase"
import { Request, Response, NextFunction } from "express"

interface AuthenticatedRequest extends Request {
	user?: { uid: string; email: string; role?: string }
}

export const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	const authHeader = req.headers.authorization

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		res.status(401).json({ error: "Unauthorized: No token provided" })
		return
	}

	const token = authHeader.split("Bearer ")[1]

	try {
		const decodedToken = await admin.auth().verifyIdToken(token)
		req.user = { uid: decodedToken.uid, email: decodedToken.email! }

		const userQuerySnapshot = await db.collection("users").where("email", "==", decodedToken.email).limit(1).get()

		if (userQuerySnapshot.empty) {
			res.status(403).json({ error: "Forbidden: User not found in database" })
			return
		}

		const userDoc = userQuerySnapshot.docs[0]
		req.user!.role = userDoc.data().role

		next()
	} catch (error) {
		console.error("Auth error:", error)
		res.status(401).json({ error: "Unauthorized: Invalid token" })
	}
}
