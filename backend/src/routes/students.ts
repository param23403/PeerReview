import express, { Request, Response } from "express";
import { db } from "../../netlify/functions/firebase";

const router = express.Router();

const searchStudents = async (req: Request, res: Response): Promise<void> => {
  const { search = "", page = 1, limit = 20 } = req.query;

  const searchTerm = search;
  const pageNumber = parseInt(page.toString(), 10);
  const pageSize = parseInt(limit.toString(), 10);

  try {
    const studentsRef = db.collection("students");
    const nameQuerySnapshot = await studentsRef
      .orderBy("name")
      .startAt(searchTerm)
      .endAt(searchTerm + "\uf8ff")
      .get();

    const computingIdQuerySnapshot = await studentsRef
      .orderBy("computingID")
      .startAt(searchTerm)
      .endAt(searchTerm + "\uf8ff")
      .get();

    const resultsMap = new Map();

    nameQuerySnapshot.forEach((doc) => {
      resultsMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    computingIdQuerySnapshot.forEach((doc) => {
      resultsMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    if (nameQuerySnapshot.empty && computingIdQuerySnapshot.empty) {
      res.status(200).json({
        students: [],
        hasNextPage: false,
        total: 0,
      });
      return;
    }
    const filteredStudents = Array.from(resultsMap.values());

    const total = filteredStudents.length;
    const paginatedStudents = filteredStudents.slice(
      (pageNumber - 1) * pageSize,
      pageNumber * pageSize
    );
    const hasNextPage = pageNumber * pageSize < total;

    res.status(200).json({
      students: paginatedStudents,
      hasNextPage,
      total,
    });
  } catch (error) {
    console.error("Error fetching students: ", error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

const getStudent = async (req: Request, res: Response): Promise<void> => {
  const { studentID } = req.params;

  try {
    const studentRef = db.collection("students").doc(studentID);
    const studentDoc = await studentRef.get();

    if (!studentDoc.exists) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    res.status(200).json({
      id: studentDoc.id,
      ...studentDoc.data(),
    });
  } catch (error) {
    console.error("Error fetching student: ", error);
    res.status(500).json({ message: "Failed to fetch student" });
  }
};

const addStudent = async (req: Request, res: Response): Promise<void> => {
  const {
    team,
    computingID,
    lastName,
    firstName,
    preferredPronouns,
    githubID,
    discordID,
  } = req.body;

  console.log("Received student data:", req.body);

  try {
    const studentsRef = db.collection("students");
    const snapshot = await studentsRef.get();

    await studentsRef.doc(computingID).set({
      team,
      computingID,
      lastName,
      firstName,
      preferredPronouns,
      githubID,
      discordID,
    });

    const teamRef = db.collection("teams").doc(team);
    const teamDoc = await teamRef.get();

    if (teamDoc.exists) {
      const currentStudents = teamDoc.data()?.students || [];
      currentStudents.push({ computingID, firstName, lastName });

      await teamRef.update({ students: currentStudents });
    } else {
      await teamRef.set({ students: [{ computingID, firstName, lastName }] });
    }

    res.status(201).json({ message: "Student added successfully" });
  } catch (error) {
    console.error("Error adding student:", error);
    res.status(500).json({ message: "Failed to add student" });
  }
};

const removeStudent = async (req: Request, res: Response): Promise<void> => {
  const { computingID } = req.body;

  try {
    const studentsRef = db.collection("students");
    const snapshot = await studentsRef
      .where("computingID", "==", computingID)
      .get();

    if (snapshot.empty) {
      console.log("No matching student found.");
      res.status(404).json({ message: "Student not found" });
      return;
    }

    const batch = db.batch();
    let teamID = "";

    snapshot.forEach((doc) => {
      const studentData = doc.data();
      teamID = studentData.team;
      batch.delete(studentsRef.doc(doc.id));
    });

    const teamRef = db.collection("teams").doc(teamID);
    const teamDoc = await teamRef.get();

    if (teamDoc.exists) {
      const currentStudents = teamDoc.data()?.students || [];
      const updatedStudents = currentStudents.filter(
        (s: any) => s.computingID !== computingID
      );

      batch.update(teamRef, { students: updatedStudents });
    }

    await batch.commit();
    res.status(200).json({ message: "Student removed successfully" });
  } catch (error) {
    console.error("Error removing student:", error);
    res.status(500).json({ message: "Failed to remove student" });
  }
};

router.post("/add", addStudent);
router.post("/remove", removeStudent);
router.get("/search", searchStudents);
router.get("/getStudent/:studentID", getStudent);

export default router;
