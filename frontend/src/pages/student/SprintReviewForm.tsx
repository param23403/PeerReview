import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { toast } from "../../hooks/use-toast";
import { Toaster } from "../../components/ui/toaster";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import api from "../../api";
import { FaCheckCircle } from "react-icons/fa";
import BackButton from "../../components/BackButton";
import RubricPopover from "../../components/Popover";

const options = [
  { label: "Never", value: "1" },
  { label: "Rarely", value: "2" },
  { label: "Sometimes", value: "3" },
  { label: "Usually", value: "4" },
  { label: "Always", value: "5" },
];

const evaluationQuestions = [
  {
    key: "keptUpWithResponsibilities",
    label: "Has this person kept up with their role responsibilities? (Scrum Master, DevOps, Testing, Reqs)",
  },
  {
    key: "helpedTeamMembers",
    label: "Has this person helped team members when appropriate?",
  },
  {
    key: "communicatedEffectively",
    label: "Has this person been effective at communicating with the team?",
  },
  {
    key: "ideasTakenSeriously",
    label: "Were your ideas taken seriously by this person?",
  },
  {
    key: "putInAppropriateTime",
    label: "Has this person put in the appropriate time for the project?",
  },
]

export default function SprintReviewForm() {
  const location = useLocation();
  const { review } = location.state || {};

  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  interface FormData {
    keptUpWithResponsibilities: string;
    helpedTeamMembers: string;
    communicatedEffectively: string;
    ideasTakenSeriously: string;
    putInAppropriateTime: string;
    compatibility: string;
    overallEvaluationScore: string;
    improvementFeedback?: string;
    strengthFeedback?: string;
    isFlagged: boolean;
  }

  const [formData, setFormData] = useState<FormData>({
    keptUpWithResponsibilities: "",
    helpedTeamMembers: "",
    communicatedEffectively: "",
    ideasTakenSeriously: "",
    putInAppropriateTime: "",
    compatibility: "",
    overallEvaluationScore: "",
    improvementFeedback: "",
    strengthFeedback: "",
    isFlagged: false,
  });

  const handleInputChange = (name: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const mutation = useMutation({
    mutationFn: async (reviewData: FormData) => {
      return api.post("/reviews/submitReview", reviewData);
    },
    onSuccess: () => {
      setReviewSubmitted(true);
      setIsSubmitting(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      setIsSubmitting(false)
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true)

    const validationFields: Omit<FormData, "improvementFeedback" | "strengthFeedback"> = {
      keptUpWithResponsibilities: formData.keptUpWithResponsibilities,
      helpedTeamMembers: formData.helpedTeamMembers,
      communicatedEffectively: formData.communicatedEffectively,
      ideasTakenSeriously: formData.ideasTakenSeriously,
      putInAppropriateTime: formData.putInAppropriateTime,
      compatibility: formData.compatibility,
      overallEvaluationScore: formData.overallEvaluationScore,
      isFlagged: formData.isFlagged,
    };

    if (Object.values(validationFields).includes("")) {
      toast({
        title: "Error",
        description: "Please answer all required questions before submitting.",
        variant: "destructive",
        duration: 3000,
      });
      setIsSubmitting(false)
      return;
    }

    const reviewData = {
      reviewerId: review.reviewerId,
      sprintId: review.sprintId,
      reviewedTeammateId: review.reviewedTeammateId,
      reviewCompleted: true,
      ...formData,
    };

    mutation.mutate(reviewData);
  };


  if (review.reviewCompleted || reviewSubmitted) {
    return (
      <div className="container mx-auto w-full max-w-3xl py-4">
        <BackButton useNavigateBack />
        <div className="flex flex-col items-center text-center mt-16">
          <FaCheckCircle className="text-success mb-4 w-16 h-16" />
          <h2 className="text-2xl font-bold mb-2">Review Submitted</h2>
          <p className="text-lg mb-6">
            A review has successfully been submitted for {review.reviewedTeammateName}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto w-full max-w-3xl py-4">
      <BackButton useNavigateBack />
      <Card className="mx-4 shadow-md border border-muted">
        <CardHeader className="flex items-center justify-between">
          <div className="flex-grow">
            <CardTitle className="text-center text-xl font-bold">
              Teammate Evaluation
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Evaluating your teammate: {review.reviewedTeammateName} (
              {review.reviewedTeammateId})
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
            {/* Evaluation Section */}
            <h3 className="text-lg font-bold">Evaluation</h3>
              {evaluationQuestions.map(({ key, label }) => (
                <div key={key}>
                  <Label className="block mb-2 text-sm font-medium">{label}</Label>
                  <RadioGroup
                    value={formData[(key as keyof FormData)] as string}
                    onValueChange={(value) => handleInputChange(key, value)}
                  >
                    <div className="flex justify-between space-x-4 mb-4 mt-2">
                      {options.map((option) => (
                        <div key={option.label} className="flex flex-col items-center w-full">
                          <RadioGroupItem value={option.value} id={`${key}-${option.label}`} />
                          <Label htmlFor={`${key}-${option.label}`} className="mt-1 text-center">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              ))}

            {/* Compatibility Section */}
            <h3 className="text-lg font-bold pt-4">Compatibility</h3>
            <RadioGroup
              value={formData.compatibility}
              onValueChange={(value) =>
                handleInputChange("compatibility", value)
              }
            >
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Not at all compatible
                </Label>
                <div className="flex justify-between items-center flex-grow">
                  {["1", "2", "3", "4", "5"].map((option) => (
                    <div
                      key={option}
                      className="flex flex-col items-center flex-grow"
                    >
                      <RadioGroupItem
                        value={option}
                        id={`compatibility-${option}`}
                      />
                      <Label
                        htmlFor={`compatibility-${option}`}
                        className="mt-1 text-center"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
                <Label className="text-sm font-medium">Very compatible</Label>
              </div>
            </RadioGroup>

            {/* Overall Evaluation Score */}
            <div className="flex items-center gap-2 pt-4">
              <h3 className="text-lg font-bold">Overall Score</h3>
              <RubricPopover />
            </div>
            <RadioGroup
              value={formData.overallEvaluationScore}
              onValueChange={(value) =>
                handleInputChange("overallEvaluationScore", value)
              }
            >
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Active hindrance to team
                </Label>
                <div className="flex justify-between items-center flex-grow">
                  {["1", "2", "3", "4", "5"].map((option) => (
                    <div
                      key={option}
                      className="flex flex-col items-center flex-grow"
                    >
                      <RadioGroupItem
                        value={option}
                        id={`compatibility-${option}`}
                      />
                      <Label
                        htmlFor={`compatibility-${option}`}
                        className="mt-1 text-center"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
                <Label className="text-sm font-medium">Excellent</Label>
              </div>
            </RadioGroup>

            {/* Improvement Area */}
            <h3 className="text-lg font-bold pt-4">Feedback</h3>
            <div className="space-y-2">
              <Label
                htmlFor="improvementFeedback"
                className="text-sm font-medium"
              >
                What is something you would like to see this student improve on?
              </Label>
              <Textarea
                id="improvementFeedback"
                name="improvementFeedback"
                placeholder="Optional feedback"
                maxLength={250}
                value={formData.improvementFeedback || ""}
                onChange={(e) =>
                  handleInputChange("improvementFeedback", e.target.value)
                }
                className="w-full"
              />
              <p className="text-sm text-muted-foreground text-right">
                {formData.improvementFeedback?.length || 0}/250
              </p>
            </div>

            {/* Strength Area */}
            <div className="space-y-2">
              <Label htmlFor="strengthFeedback" className="text-sm font-medium">
                What is something this student has done particularly well on?
              </Label>
              <Textarea
                id="strengthFeedback"
                name="strengthFeedback"
                placeholder="Optional feedback"
                maxLength={250}
                value={formData.strengthFeedback || ""}
                onChange={(e) =>
                  handleInputChange("strengthFeedback", e.target.value)
                }
                className="w-full"
              />
              <p className="text-sm text-muted-foreground text-right">
                {formData.strengthFeedback?.length || 0}/250
              </p>
            </div>

            {/* Flag Review */}
            <div className="flex items-center justify-start space-x-2">
              <Label htmlFor="isFlagged" className="text-sm font-medium">
                Would you like to flag this review for the professor?{" "}
              </Label>
              <Checkbox
                id="isFlagged"
                checked={formData.isFlagged}
                onCheckedChange={(checked) =>
                  handleInputChange("isFlagged", checked)
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground"
              disabled={isSubmitting}
            >
              Submit Evaluation
            </Button>
          </form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}
