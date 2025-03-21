import express, { Request, Response } from "express";
import { db } from "../../netlify/functions/firebase";
import { authenticateUser } from "../../netlify/functions/middleware/auth";

const router = express.Router();

const getSprints = async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection("sprints").get();
    const sprints = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
    res.status(200).json(sprints);
  } catch (error) {
    console.error("Error fetching sprints:", error);
    res.status(500).json({ message: "Failed to fetch sprints" });
  }
};

const getSprint = async (req: Request, res: Response): Promise<void> => {
  const { sprintId } = req.params;

  if (!sprintId) {
    res.status(400).json({ message: "Missing sprint ID in request" });
    return;
  }

  try {
    const sprintRef = db.collection("sprints").doc(sprintId);
    const sprintSnap = await sprintRef.get();

    if (!sprintSnap.exists) {
      res.status(404).json({ message: "Sprint not found" });
      return;
    }

    const sprint = { id: sprintSnap.id, ...sprintSnap.data() };
    res.status(200).json(sprint);
  } catch (error) {
    console.error("Error fetching sprint:", error);
    res.status(500).json({ message: "Failed to fetch sprint" });
  }
};

const getStudentSprints = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { reviewerId } = req.params;

  if (!reviewerId) {
    res.status(400).json({ message: "Missing reviewerId parameter" });
    return;
  }

  try {
    // Fetch the student document directly by its id
    const studentSnapshot = await db
      .collection("students")
      .where("computingID", "==", reviewerId)
      .get();

    if (studentSnapshot.empty) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    const studentData = studentSnapshot.docs[0].data();
    const teamId = studentData.team;

    if (!teamId) {
      res.status(400).json({ message: "Student not assigned to a team" });
      return;
    }

    // Fetch all students with the same teamId
    const teamStudentsSnapshot = await db
      .collection("students")
      .where("team", "==", teamId)
      .get();

    if (teamStudentsSnapshot.empty) {
      res.status(404).json({ message: "No students found for this team" });
      return;
    }

    const totalStudents = teamStudentsSnapshot.docs.length;

    // Fetch completed reviews
    const reviewsSnapshot = await db
      .collection("reviews")
      .where("reviewerId", "==", reviewerId)
      .get();

    const completedReviews: Record<string, number> = {};
    reviewsSnapshot.docs.forEach((doc) => {
      const { sprintId } = doc.data();
      if (sprintId) {
        completedReviews[sprintId] = (completedReviews[sprintId] || 0) + 1;
      }
    });

    // Fetch sprints
    const sprintsSnapshot = await db.collection("sprints").get();
    const sprints = sprintsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Merge results
    const result = sprints.map((sprint) => ({
      ...sprint,
      completedReviews: completedReviews[sprint.id] || 0,
      totalReviews: totalStudents - 1,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching student sprints:", error);
    res.status(500).json({ message: "Failed to fetch student sprints" });
  }
};

const updateSprint = async (req: Request, res: Response): Promise<void> => {
  const { name, reviewDueDate, sprintDueDate, sprintId } = req.body;
  if (!sprintId) {
    res.status(400).json({ message: "Missing sprint ID in request" });
    return;
  }

  if (!name || !reviewDueDate || !sprintDueDate) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    const sprintRef = db.collection("sprints").doc(sprintId);
    const sprintSnap = await sprintRef.get();

    if (!sprintSnap.exists) {
      res.status(404).json({ message: "Sprint not found" });
      return;
    }

    const reviewDueDateTimestamp = new Date(reviewDueDate);
    const sprintDueDateTimestamp = new Date(sprintDueDate);

    if (reviewDueDateTimestamp <= sprintDueDateTimestamp) {
      res
        .status(400)
        .json({ message: "Review due date must be after sprint due date" });
      return;
    }

    await sprintRef.update({
      name,
      reviewDueDate: reviewDueDateTimestamp,
      sprintDueDate: sprintDueDateTimestamp,
    });

    res.status(200).json({ message: "Sprint updated successfully" });
  } catch (error) {
    console.error("Error updating sprint:", error);
    res.status(500).json({ message: "Failed to update sprint" });
  }
};

router.get("/getSprints", authenticateUser, getSprints);
router.get("/getSprint/:sprintId", authenticateUser, getSprint);
router.get("/getStudentSprints/:reviewerId", authenticateUser, getStudentSprints);

router.post("/updateSprint", updateSprint);

export default router;
