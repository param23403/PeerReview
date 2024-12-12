import express, { Request, Response } from "express";
import { db } from "../../netlify/functions/firebase";

const router = express.Router();

const getSprints = async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection("sprints").orderBy("sprintNumber").get();
    const sprints = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(sprints);
  } catch (error) {
    console.error("Error fetching sprints:", error);
    res.status(500).json({ message: "Failed to fetch sprints" });
  }
};

const getSprint = async (req: Request, res: Response): Promise<void> => {
  const { sprintNumber } = req.params;

  if (!sprintNumber) {
    res.status(400).json({ message: "Missing sprint number in request" });
    return;
  }

  try {
    const snapshot = await db
      .collection("sprints")
      .where("sprintNumber", "==", Number(sprintNumber))
      .get();

    if (snapshot.empty) {
      res.status(404).json({ message: "Sprint not found" });
      return;
    }

    const sprint = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))[0]; // Since we expect only one result

    res.status(200).json(sprint);
  } catch (error) {
    console.error("Error fetching sprint:", error);
    res.status(500).json({ message: "Failed to fetch sprint" });
  }
};

router.get("/getSprints", getSprints);
router.get("/getSprint/:sprintNumber", getSprint);

export default router;
