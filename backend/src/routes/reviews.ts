import express, { Request, Response } from "express"
import { db } from "../../netlify/functions/firebase"

const router = express.Router()

const countCompletedReviewsBySprint = async (req: Request, res: Response): Promise<void> => {
  const { reviewerId } = req.params;

  if (!reviewerId) {
    res.status(400).json({ message: "Missing studentId parameter" });
    return;
  }

  try {
    const snapshot = await db.collection("reviews").where("reviewerId", "==", reviewerId).get();

    const completedReviews: Record<string, number> = {};
    snapshot.docs.forEach((doc) => {
      const { sprintId } = doc.data();
      if (sprintId) {
        completedReviews[sprintId] = (completedReviews[sprintId] || 0) + 1;
      }
    });

    res.status(200).json(completedReviews);
  } catch (error) {
    console.error("Error fetching completed reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

const getReviewsByReviewerAndSprint = async (req: Request, res: Response): Promise<void> => {
  const { reviewerId, sprintId } = req.params;

  if (!reviewerId || !sprintId) {
    res.status(400).json({ message: "Missing reviewerId or sprintId parameter" });
    return;
  }

  try {
    const snapshot = await db
      .collection("reviews")
      .where("reviewerId", "==", reviewerId)
      .where("sprintId", "==", sprintId)
      .get();

    if (snapshot.empty) {
      res.status(404).json({ message: "No reviews found" });
      return;
    }

    const reviews = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

router.get("/countCompletedReviewsBySprint/:reviewerId", countCompletedReviewsBySprint);
router.get("/reviews/:reviewerId/:sprintId", getReviewsByReviewerAndSprint);

export default router;