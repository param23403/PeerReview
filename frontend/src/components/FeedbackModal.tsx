import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  improvement: string
  strength: string
}

export function FeedbackModal({ isOpen, onClose, improvement, strength }: FeedbackModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feedback Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Areas for Improvement</h3>
            <p>{improvement || "No feedback provided"}</p>
          </div>
          <div>
            <h3 className="font-semibold">Strengths</h3>
            <p>{strength || "No feedback provided"}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}