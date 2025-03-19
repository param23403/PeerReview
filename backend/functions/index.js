import './firebase'
import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.USER, 
    pass: process.env.PASSWORD, 
  },
});

const sendReminder = async (toEmail, studentName, sprintId) => {
  const mailOptions = {
    from: process.env.USER,
    to: toEmail,
    subject: `Reminder: Review Pending for Sprint ${sprintId}`,
    text: `This is a reminder that you have not yet completed your review for sprint ${sprintId}. Please make sure to complete it before the sprint deadline.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending reminder email:', error);
  }
};

export const scheduleJobs = functions.pubsub.schedule('every day 03:00').onRun(async () => {
    console.log('Checking for incomplete reviews...');

    const reviewsSnapshot = await admin.firestore()
      .collection('reviews')
      .where('reviewCompleted', '==', false)
      .get();

    if (!reviewsSnapshot.empty) {
      for (const doc of reviewsSnapshot.docs) {
        const review = doc.data();
        const sprintId = review.sprintId;
        const reviewedTeammateId = review.reviewedTeammateId;

        const studentSnapshot = await admin.firestore()
          .collection('students')
          .where('computingID', '==', reviewedTeammateId)
          .get();

        if (!studentSnapshot.empty) {
          const studentData = studentSnapshot.docs[0].data();
          const studentEmail = studentData.email;
          const studentName = studentData.name;

          await sendReminder(studentEmail, studentName, sprintId);
        }
      }
    } else {
      console.log('No reviews found that need reminders.');
    }

    console.log('All done! See you tomorrow morning!');
  }
);