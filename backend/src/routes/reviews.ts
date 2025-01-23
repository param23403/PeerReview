import express, { Request, Response } from "express";
import { db } from "../../netlify/functions/firebase";

const router = express.Router();

const getReviewsByReviewerAndSprint = async (req: Request, res: Response): Promise<void> => {
  const { reviewerId, sprintId } = req.params;

  if (!reviewerId || !sprintId) {
    res.status(400).json({ message: "Missing reviewerId or sprintId parameter" });
    return;
  }

  try {
    // Fetch the student to get their teamId
    const studentSnapshot = await db
      .collection("students")
      .where("computingId", "==", reviewerId)
      .get();

    if (studentSnapshot.empty) {
      res.status(404).json({ message: "Reviewer not found" });
      return;
    }

    const studentData = studentSnapshot.docs[0].data();
    const teamId = studentData.team;

    // Fetch students from the same teamId
    const teamStudentsSnapshot = await db
      .collection("students")
      .where("team", "==", teamId)
      .get();

    const students = teamStudentsSnapshot.docs.map(doc => doc.data());

    // Filter out the reviewer themselves
    const teammates = students.filter((student: any) => student.computingId !== reviewerId);

    // Fetch existing reviews for reviewer and sprint
    const reviewsSnapshot = await db
      .collection("reviews")
      .where("reviewerId", "==", reviewerId)
      .where("sprintId", "==", sprintId)
      .get();

    const existingReviews = reviewsSnapshot.docs.map(doc => doc.data());

    // Combine teammates with review + completion status
    const reviews = teammates.map((teammate: any) => {
      const reviewCompleted = existingReviews.some(
        (review) =>
          review.reviewedTeammateId === teammate.computingId &&
          review.sprintId === sprintId
      );

      return {
        reviewedTeammateId: teammate.computingId,
        reviewedTeammateName: teammate.name,
        sprintId,
        reviewCompleted,
      };
    });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching team or reviews:", error);
    res.status(500).json({ message: "Failed to fetch team or reviews" });
  }
};

router.get("/getReviews/:reviewerId/:sprintId", getReviewsByReviewerAndSprint);

export default router;
