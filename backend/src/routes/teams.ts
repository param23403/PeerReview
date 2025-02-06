import express, { Request, Response } from "express";
import multer from "multer";
import csvParser from "csv-parser";
import { Readable } from "stream";
import { db } from "../../netlify/functions/firebase";
import { FieldPath } from "firebase-admin/firestore";

const router = express.Router();
const upload = multer();

const saveTeamsAndStudents = async (students: any[]) => {
  try {
    const batch = db.batch();

    const teamsMap = students.reduce((teams, student) => {
      if (!teams[student.team]) {
        teams[student.team] = [];
      }
      teams[student.team].push(student);
      return teams;
    }, {} as Record<string, any[]>);

    await Promise.all(
      Object.keys(teamsMap).map(async (teamID) => {
        const teamRef = db.collection("teams").doc(teamID);
        const teamDoc = await teamRef.get();

        let existingStudents = [];
        if (teamDoc.exists) {
          existingStudents = teamDoc.data()?.students || [];
        }

        const updatedStudents = [...existingStudents, ...teamsMap[teamID]];

        batch.set(teamRef, { students: updatedStudents }, { merge: true });
      })
    );

    students.forEach((student) => {
      const studentRef = db.collection("students").doc(student.computingID);
      batch.set(studentRef, {
        id: student.computingID,
        name: `${student.firstName} ${student.lastName}`,
        computingID: student.computingID,
        team: student.team,
        joinedAt: new Date().toISOString(),
        active: false,
        githubID: student.githubID || null,
        discordID: student.discordID || null,
        preferredPronouns: student.preferredPronouns || null,
      });
    });

    await batch.commit();
  } catch (error) {
    console.error("Error saving to Firebase:", error);
    throw error;
  }
};

const createTeams = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    console.error("No file uploaded");
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  try {
    const fileStream = new Readable();
    fileStream.push(req.file.buffer);
    fileStream.push(null);

    const students: any[] = [];

    fileStream
      .pipe(csvParser())
      .on("data", (data) => {
        students.push({
          team: data["Team"].split(" ").join("").split("-").join(""),
          computingID: data["Computing ID"],
          lastName: data["Last Name"],
          firstName: data["First Name"],
          preferredPronouns: data["Preferred Pronouns"],
          githubID: data["GitHub ID"],
          discordID: data["Discord ID"],
        });
      })
      .on("end", async () => {
        try {
          await saveTeamsAndStudents(students);
          res
            .status(201)
            .json({ message: "Teams and students successfully created" });
        } catch (saveError) {
          console.error(
            "Error saving teams and students to Firebase:",
            saveError
          );
          res
            .status(500)
            .json({ message: "Failed to save teams and students to Firebase" });
        }
      })
      .on("error", (parseError) => {
        console.error("Error parsing CSV:", parseError);
        res.status(500).json({ message: "Failed to parse file" });
      });
  } catch (error) {
    console.error("Unexpected error during file processing:", error);
    res
      .status(500)
      .json({ message: "Unexpected error occurred. Please try again." });
  }
};

const getTeam = async (req: Request, res: Response): Promise<void> => {
  const { teamID } = req.params;

  try {
    const teamRef = db.collection("teams").doc(teamID);
    const teamDoc = await teamRef.get();

    if (!teamDoc.exists) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    res.status(200).json({
      id: teamDoc.id,
      ...teamDoc.data(),
    });
  } catch (error) {
    console.error("Error fetching team by ID: ", error);
    res.status(500).json({ message: "Failed to fetch team" });
  }
};

const searchTeams = async (req: Request, res: Response): Promise<void> => {
  const { search = "", page = 1, limit = 20 } = req.query;
  const searchTerm = search;

  const pageNumber = parseInt(page.toString(), 10);
  const pageSize = parseInt(limit.toString(), 10);

  try {
    const teamsRef = db.collection("teams");

    const teamsQuerySnapshot = await teamsRef
      .orderBy("name")
      .startAt(searchTerm)
      .endAt(searchTerm + "\uf8ff")
      .get();

    if (teamsQuerySnapshot.empty) {
      res.status(200).json({
        teams: [],
        hasNextPage: false,
        total: 0,
      });
      return;
    }
    const allTeams = teamsQuerySnapshot.docs.map((doc) => ({
      team: doc.id,
      ...doc.data(),
    }));
    const total = allTeams.length;
    const paginatedTeams = allTeams.slice(
      (pageNumber - 1) * pageSize,
      pageNumber * pageSize
    );
    const hasNextPage = pageNumber * pageSize < total;

    res.status(200).json({
      teams: paginatedTeams,
      hasNextPage,
      total,
    });
  } catch (error) {
    console.error("Error fetching teams: ", error);
    res.status(500).json({ message: "Failed to fetch Teams" });
  }
};

const searchTeamsBySprint = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { search = "", page = 1, limit = 20, sprintID } = req.query;
  if (!sprintID) {
    res.status(400).json({ message: "Missing sprintId query parameter" });
    return;
  }
  const searchTerm = search.toString();
  const pageNumber = parseInt(page.toString(), 10);
  const pageSize = parseInt(limit.toString(), 10);
  const sprintIdStr = sprintID.toString();

  try {
    const teamsRef = db.collection("teams");

    let teamsQuery = teamsRef.orderBy("name");
    if (searchTerm) {
      teamsQuery = teamsQuery.startAt(searchTerm).endAt(searchTerm + "\uf8ff");
    }

    const teamsQuerySnapshot = await teamsQuery.get();
    if (teamsQuerySnapshot.empty) {
      res.status(200).json({
        teams: [],
        hasNextPage: false,
        total: 0,
      });
      return;
    }

    const allTeams = teamsQuerySnapshot.docs.map((doc) => ({
      team: doc.id,
      ...doc.data(),
    }));

    const enrichedTeams = await Promise.all(
      allTeams.map(async (team: any) => {
        const studentsArr = team.students
          ? Array.isArray(team.students)
            ? team.students
            : Object.values(team.students)
          : [];
        const studentIds = studentsArr.map(
          (student: any) => student.computingID
        );
        const teamSize = studentIds.length;
        const expectedCount = teamSize * (teamSize - 1);
        if (teamSize < 2) {
          return {
            ...team,
            pendingReviews: 0,
            minAvgScore: null,
          };
        }

        let reviews: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[] =
          [];
        try {
          const reviewsSnapshot = await db
            .collection("reviews")
            .where("sprintId", "==", sprintIdStr)
            .where("reviewerId", "in", studentIds)
            .get();
          reviews = reviewsSnapshot.docs.filter((doc) => {
            const data = doc.data();
            return studentIds.includes(data.reviewedTeammateId);
          });
        } catch (err) {
          const reviewsSnapshot = await db
            .collection("reviews")
            .where("sprintId", "==", sprintIdStr)
            .get();
          reviews = reviewsSnapshot.docs.filter((doc) => {
            const data = doc.data();
            return (
              studentIds.includes(data.reviewerId) &&
              studentIds.includes(data.reviewedTeammateId)
            );
          });
        }

        const actualCount = reviews.length;
        const pendingReviews = expectedCount - actualCount;

        const averages: { [key: string]: { total: number; count: number } } =
          {};
        reviews.forEach((doc) => {
          const data = doc.data();
          const reviewee = data.reviewedTeammateId;
          const score = parseFloat(data.overallEvaluationScore);
          if (!isNaN(score)) {
            if (!averages[reviewee]) {
              averages[reviewee] = { total: score, count: 1 };
            } else {
              averages[reviewee].total += score;
              averages[reviewee].count += 1;
            }
          }
        });

        let minAvgScore: number | null = null;
        let minId: string | null = null;
        studentIds.forEach((id: any) => {
          if (averages[id] && averages[id].count > 0) {
            const avg = averages[id].total / averages[id].count;
            if (minAvgScore === null || avg < minAvgScore) {
              minAvgScore = avg;
              minId = id;
            }
          }
        });

        return {
          ...team,
          pendingReviews,
          minAvgScore,
          minId,
        };
      })
    );

    enrichedTeams.sort((a, b) => {
      const aScore = a.minAvgScore !== null ? a.minAvgScore : Infinity;
      const bScore = b.minAvgScore !== null ? b.minAvgScore : Infinity;
      return aScore - bScore;
    });

    const total = enrichedTeams.length;
    const paginatedTeams = enrichedTeams.slice(
      (pageNumber - 1) * pageSize,
      pageNumber * pageSize
    );
    const hasNextPage = pageNumber * pageSize < total;

    res.status(200).json({
      teams: paginatedTeams,
      hasNextPage,
      total,
    });
  } catch (error: any) {
    console.error("Error fetching teams: ", error);
    res.status(500).json({ message: "Failed to fetch Teams" });
  }
};

router.post("/create", upload.single("file"), createTeams);
router.get("/search", searchTeams);
router.get("/getTeam/:teamID", getTeam);
router.get("/searchteambysprint", searchTeamsBySprint);

export default router;
