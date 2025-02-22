import express, { Request, Response } from "express";
import { db } from "../../netlify/functions/firebase";

const router = express.Router();

const getStudentByComputingId = async (computingId: string) => {
  const snapshot = await db
    .collection("students")
    .where("computingID", "==", computingId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const studentDoc = snapshot.docs[0];
  return { id: studentDoc.id, ...studentDoc.data() as any };
};

const getUserData = async (req: Request, res: Response): Promise<void> => {
  const { uid } = req.params;

  if (!uid) {
    res.status(400).send({ message: "Missing user ID in request" });
    return;
  }

  try {
    const userDocRef = db.doc(`users/${uid}`);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      res.status(404).send({ message: "User data not found" });
      return;
    }

    res.status(200).json(userDoc.data());
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send({ message: "Failed to fetch user data" });
  }
};

const addUserToFirestore = async (req: Request, res: Response): Promise<void> => {
  const { uid, computingId, email } = req.body;

  if (!uid || !computingId || !email) {
    res.status(400).json({ message: "Missing required fields: uid, computingId, email" });
    return;
  }

  try {
    const studentData = await getStudentByComputingId(computingId);

    if (!studentData) {
      res.status(404).json({ message: "Invalid computingId. No matching student found." });
      return;
    }

    const batch = db.batch();

    const userDocRef = db.doc(`users/${uid}`);
    batch.set(userDocRef, {
      studentId: studentData.id,
      email,
      role: "student",
      createdAt: new Date(),
    });

    const studentDocRef = db.doc(`students/${studentData.id}`);
    batch.update(studentDocRef, {
      joinedAt: new Date(),
      active: true,
    });

    if (studentData.team) {
      const teamRef = db.doc(`teams/${studentData.team}`);
      const teamDoc = await teamRef.get();

      if (teamDoc.exists) {
        const teamData = teamDoc.data();
        const updatedStudents = (teamData?.students || []).map((student: any) => {
          if (student.computingID === computingId) {
            return { ...student, active: true };
          }
          return student;
        });

        batch.update(teamRef, { students: updatedStudents });
      }
    }

    await batch.commit();

    res.status(201).json({ message: "User data successfully added to Firestore" });
  } catch (error) {
    console.error("Error adding user data to Firestore:", error);
    res.status(500).json({
      message: "An unexpected error occurred",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const addProfessorToFirestore = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { uid, computingId, email } = req.body;

  if (!uid || !computingId || !email) {
    res
      .status(400)
      .json({ message: "Missing required fields: uid, computingId, email" });
    return;
  }

  try {
    const userDocRef = db.doc(`users/${uid}`);
    await userDocRef.set({
      professorId: computingId,
      email,
      role: "professor",
      createdAt: new Date(),
    });

    res
      .status(201)
      .json({ message: "Professor data successfully added to Firestore" });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      message: "An unexpected error occurred",
      error: errorMessage,
    });
    console.error("Error adding user data to Firestore:", error);
  }
};

router.get("/getUser/:uid", getUserData);
router.post("/addUser", addUserToFirestore);
router.post("/addProfessor", addProfessorToFirestore);

export default router;
