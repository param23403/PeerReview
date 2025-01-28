import express, { Request, Response } from "express";
import { db } from "../../netlify/functions/firebase";

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
      query = query.where("redFlag", "==", true);
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

router.get("/search", getReviews);

export default router;
