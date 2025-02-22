import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { FeedbackModal } from "./FeedbackModal";
import { Button } from "./ui/button";
import { FaFlag } from "react-icons/fa";

interface Review {
  reviewerId: string
  keptUpWithResponsibilities: string
  helpedTeamMembers: string
  communicatedEffectively: string
  ideasTakenSeriously: string
  putInAppropriateTime: string
  compatibility: string
  overallEvaluationScore: string
  improvementFeedback?: string
  strengthFeedback?: string
  isFlagged: boolean
}


interface ReviewGridProps {
  reviews: Review[]
}

export function ReviewGrid({ reviews }: ReviewGridProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<{ improvement: string; strength: string } | null>(null)

  const headers = [
    "Reviewer",
    "Responsibilities",
    "Helped Team",
    "Communication",
    "Ideas Valued",
    "Time Invested",
    "Compatibility",
    "Overall Score",
    "Flagged",
    "Feedback",
  ]

  const openFeedbackModal = (review: Review) => {
    setSelectedFeedback({
      improvement: review.improvementFeedback || "",
      strength: review.strengthFeedback || "",
    })
    setIsModalOpen(true)
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review, index) => (
            <TableRow key={index}>
              <TableCell>{review.reviewerId}</TableCell>
              <TableCell>{review.keptUpWithResponsibilities}</TableCell>
              <TableCell>{review.helpedTeamMembers}</TableCell>
              <TableCell>{review.communicatedEffectively}</TableCell>
              <TableCell>{review.ideasTakenSeriously}</TableCell>
              <TableCell>{review.putInAppropriateTime}</TableCell>
              <TableCell>{review.compatibility}</TableCell>
              <TableCell>{review.overallEvaluationScore}</TableCell>
              <TableCell>{review.isFlagged ? <FaFlag className="text-destructive" /> : "No"}</TableCell>
              <TableCell>
                <Button onClick={() => openFeedbackModal(review)}>View Feedback</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedFeedback && (
        <FeedbackModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          improvement={selectedFeedback.improvement}
          strength={selectedFeedback.strength}
        />
      )}
    </>
  )
}



