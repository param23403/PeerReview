import { db } from "../../netlify/functions/firebase"
import nodemailer from "nodemailer"

interface Sprint {
  id: string
  name: string
  reviewDueDate: FirebaseFirestore.Timestamp 
  sprintDueDate: FirebaseFirestore.Timestamp
  team: string 
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.USERNAME,
    pass: process.env.PASSWORD, 
  }
})

const sendEmail = async (sprint: Sprint, reviewerEmail: string) => {
  const { name, reviewDueDate } = sprint

  const mailOptions = {
    from: process.env.USERNAME,
    to: reviewerEmail, 
    subject: `Reminder: Sprint Review Due for ${name}`,
    text: `Your peer reviews for this sprint is due on ${reviewDueDate.toDate().toLocaleString()}. Please make sure to complete them on time.`
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Reminder email sent for sprint: ${name}`)
  } catch (error) {
    console.error("Error sending email: ", error)
  }
}

const checkSprintsDue = async () => {
  try {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split("T")[0]

    const sprintsSnapshot = await db
      .collection("sprints")
      .where("reviewDueDate", "==", tomorrowStr)
      .get()

    if (!sprintsSnapshot.empty) {

      for (const sprintDoc of sprintsSnapshot.docs) {
        const sprint = sprintDoc.data()
        const { id: sprintId, name: sprintName, team } = sprint
        const reviewsSnapshot = await db.collection("reviews").where("sprintId", "==", sprintId).get()
        const completedReviewers = new Set(reviewsSnapshot.docs.map((doc) => doc.data().reviewerId))
        const studentsSnapshot = await db.collection("students").where("team", "==", team).get()

        for (const studentDoc of studentsSnapshot.docs) {
          const studentData = studentDoc.data()
          const studentEmail = studentData.email
          const reviewerId = studentData.computingID

          if (!completedReviewers.has(reviewerId) && studentEmail) {
            await sendEmail(studentEmail, sprintName)
          }
        }
      }
    }
  } catch (error) {
    console.error("Error checking sprint reviews: ", error)
  }
}

checkSprintsDue()