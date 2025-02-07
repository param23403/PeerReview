import express, { Request, Response } from "express";
import { db } from "../../netlify/functions/firebase";
import { doc } from "firebase/firestore";

const router = express.Router();

const fetchStudentData = async (
  studentIds: string[]
): Promise<Map<string, any>> => {
  const batchSize = 30; // Firestore's `in` query limit
  const studentData = new Map();

  for (let i = 0; i < studentIds.length; i += batchSize) {
    const batchIds = studentIds.slice(i, i + batchSize);

    const studentsSnapshot = await db
      .collection("students")
      .where("__name__", "in", batchIds)
      .get();

    studentsSnapshot.docs.forEach((doc) => {
      studentData.set(doc.id, doc.data());
    });
  }

  return studentData;
};

const getReviews = async (req: Request, res: Response): Promise<void> => {
  const {
    search = "",
    sprintId = "all",
    redFlagsOnly = false,
    page = 1,
    limit = 20,
  } = req.query;

  const searchTerm = search.toString().toLowerCase();
  const pageNumber = parseInt(page.toString(), 10);
  const pageSize = parseInt(limit.toString(), 10);

  try {
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
      db.collection("reviews");

    if (sprintId && sprintId !== "all") {
      query = query.where("sprintId", "==", sprintId);
    }

    if (redFlagsOnly && redFlagsOnly === "true") {
      query = query.where("isFlagged", "==", true);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      res.status(200).json({
        reviews: [],
        hasNextPage: false,
        total: 0,
      });
      return;
    }

    const reviews = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const studentIds = [
      ...new Set(
        reviews.flatMap((review: any) => [
          review.reviewerId,
          review.reviewedTeammateId,
        ])
      ),
    ];

    const studentData = await fetchStudentData(studentIds);

    const enrichedReviews = reviews.map((review: any) => ({
      ...review,
      reviewerName: studentData.get(review.reviewerId)?.name || "Unknown",
      revieweeName:
        studentData.get(review.reviewedTeammateId)?.name || "Unknown",
      reviewerComputingId:
        studentData.get(review.reviewerId)?.computingId || "Unknown",
      revieweeComputingId:
        studentData.get(review.reviewedTeammateId)?.computingId || "Unknown",
      team: studentData.get(review.reviewerId)?.team || "Unassigned",
    }));

    const filteredReviews = enrichedReviews.filter(
      (review) =>
        review.revieweeName.toLowerCase().includes(searchTerm) ||
        review.revieweeComputingId.toLowerCase().includes(searchTerm)
    );

    const total = filteredReviews.length;
    const paginatedReviews = filteredReviews.slice(
      (pageNumber - 1) * pageSize,
      pageNumber * pageSize
    );
    const hasNextPage = pageNumber * pageSize < total;

    res.status(200).json({
      reviews: paginatedReviews,
      hasNextPage,
      total,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

const getReviewsByReviewerAndSprint = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { reviewerId, sprintId } = req.params;

  if (!reviewerId || !sprintId) {
    res
      .status(400)
      .json({ message: "Missing reviewerId or sprintId parameter" });
    return;
  }

  try {
    // Fetch the student to get their teamId
    const studentSnapshot = await db
      .collection("students")
      .where("computingID", "==", reviewerId)
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

    const students = teamStudentsSnapshot.docs.map((doc) => doc.data());

    // Filter out the reviewer themselves
    const teammates = students.filter(
      (student: any) => student.computingID !== reviewerId
    );

    // Fetch existing reviews for reviewer and sprint
    const reviewsSnapshot = await db
      .collection("reviews")
      .where("reviewerId", "==", reviewerId)
      .where("sprintId", "==", sprintId)
      .get();

    const existingReviews = reviewsSnapshot.docs.map((doc) => doc.data());

    // Combine teammates with review + completion status
    const reviews = teammates.map((teammate: any) => {
      const reviewCompleted = existingReviews.some(
        (review) =>
          review.reviewedTeammateId === teammate.computingID &&
          review.sprintId === sprintId
      );

      return {
        reviewerId: reviewerId,
        reviewedTeammateId: teammate.computingID,
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

const submitReview = async (req: Request, res: Response): Promise<void> => {
  const {
    reviewerId,
    sprintId,
    reviewedTeammateId,
    reviewCompleted,
    ...extraData
  } = req.body;

  if (!reviewerId || !sprintId || !reviewedTeammateId) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    const reviewRef = db.collection("reviews").doc();
    const reviewData = {
      reviewerId,
      sprintId,
      reviewedTeammateId,
      reviewCompleted: reviewCompleted ?? false,
      createdAt: new Date().toISOString(),
      ...extraData,
    };

    await reviewRef.set(reviewData);

    res.status(201).json({
      message: "Review submitted successfully",
      reviewId: reviewRef.id,
      review: reviewData,
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getReviewsForUserBySprint = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { computingID: computingID, sprintId } = req.params;

  if (!computingID || !sprintId) {
    res.status(400).json({ message: "Missing userId or sprintId parameter" });
    return;
  }

  try {
    // Fetch the student's teamId
    const studentSnapshot = await db
      .collection("students")
      .where("computingID", "==", computingID)
      .get();

    if (studentSnapshot.empty) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const studentData = studentSnapshot.docs[0].data();
    const name = studentData.name;

    // Fetch reviews submitted by teammates for the user
    const reviewsSnapshot = await db
      .collection("reviews")
      .where("reviewedTeammateId", "==", computingID)
      .where("sprintId", "==", sprintId)
      .get();

    const reviews = reviewsSnapshot.empty
      ? []
      : reviewsSnapshot.docs.map((doc) => doc.data());

    res.status(200).json({ name, reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

const getReviewById = async (req: Request, res: Response): Promise<void> => {
  const { reviewId: reviewId } = req.params;

  if (!reviewId) {
    res.status(400).json({ message: "Missing reviewId parameter" });
    return;
  }

  try {
    const reviewRef = db.collection("reviews").doc(reviewId);
    const reviewSnap = await reviewRef.get();
    if (!reviewSnap.exists) {
      res.status(404).json({ message: "Review not found" });
      return;
    }

    const review = reviewSnap.data();
    res.status(200).json({ review });
  } catch (error) {
    console.error("Error fetching review:", error);
    res.status(500).json({ message: "Failed to fetch review" });
  }
};

router.get("/getReviews/:reviewerId/:sprintId", getReviewsByReviewerAndSprint);

router.post("/submitReview", submitReview);

router.get(
  "/getReviewsForUserBySprint/:computingID/:sprintId",
  getReviewsForUserBySprint
);

router.get("/search", getReviews);

router.get("/getReviewById/:reviewId", getReviewById);

export default router;
