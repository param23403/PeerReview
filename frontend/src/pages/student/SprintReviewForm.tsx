import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { ArrowLeft } from "lucide-react";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import api from "../../api";

const options = [
  { label: "Never", value: "1" },
  { label: "Rarely", value: "2" },
  { label: "Sometimes", value: "3" },
  { label: "Usual", value: "4" },
  { label: "Always", value: "5" },
];

export default function SprintReviewForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { review, sprint } = location.state || {};

  const [reviewSubmitted, setReviewSubmitted] = useState(false);

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

  const handleBack = () => {
    navigate(`/sprints/${review.sprintId}/reviews`, { state: { sprint } });
  };

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
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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


  if (review.reviewCompleted) {
    return (
      <div className="container mx-auto p-4 flex justify-center bg-background text-foreground">
        <Card className="w-full max-w-2xl shadow-md border border-muted">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="text-green-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-center">
              Review Submitted
            </h2>
            <p className="text-lg mb-4 text-center">
              A review has successfully been submitted for{" "}
              {review.reviewedTeammateName}.
            </p>
          </CardContent>
          <div className="px-6 pb-6">
            <Button
              variant="outline"
              onClick={handleBack}
              className="w-full flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reviews
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (reviewSubmitted) {
    return (
      <div className="container mx-auto p-4 flex justify-center bg-background text-foreground">
        <Card className="w-full max-w-2xl shadow-md border border-muted">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="text-green-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-center">
              Review Submitted
            </h2>
            <p className="text-lg mb-4 text-center">
              A review has successfully been submitted for{" "}
              {review.reviewedTeammateName}.
            </p>
          </CardContent>
          <div className="px-6 pb-6">
            <Button
              variant="outline"
              onClick={handleBack}
              className="w-full flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reviews
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-background text-foreground">
      <Card className="w-full max-w-2xl shadow-md border border-muted">
        <CardHeader className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-bold">Evaluation</h3>
            {/* Question 1 */}
            <div>
              <Label className="block mb-2 text-sm font-medium">
                Has this person kept up with their role responsibilities? (Scrum
                Master, DevOps, Testing, Reqs)
              </Label>
              <RadioGroup
                value={formData.keptUpWithResponsibilities}
                onValueChange={(value) =>
                  handleInputChange("keptUpWithResponsibilities", value)
                }
              >
                <div className="flex justify-between space-x-4">
                  {options.map((option) => (
                    <div
                      key={option.label}
                      className="flex flex-col items-center w-full"
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`keptUpWithResponsibilities-${option}`}
                      />
                      <Label
                        htmlFor={`keptUpWithResponsibilities-${option}`}
                        className="mt-1 text-center"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Question 2 */}
            <div>
              <Label className="block mb-2 text-sm font-medium">
                Has this person helped team members when appropriate?
              </Label>
              <RadioGroup
                value={formData.helpedTeamMembers}
                onValueChange={(value) =>
                  handleInputChange("helpedTeamMembers", value)
                }
              >
                <div className="flex justify-between space-x-4">
                  {options.map((option) => (
                    <div
                      key={option.label}
                      className="flex flex-col items-center w-full"
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`helpedTeamMembers-${option}`}
                      />
                      <Label
                        htmlFor={`helpedTeamMembers-${option}`}
                        className="mt-1 text-center"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Question 3 */}
            <div>
              <Label className="block mb-2 text-sm font-medium">
                Has this person been effective at communicating with the team?
              </Label>
              <RadioGroup
                value={formData.communicatedEffectively}
                onValueChange={(value) =>
                  handleInputChange("communicatedEffectively", value)
                }
              >
                <div className="flex justify-between space-x-4">
                  {options.map((option) => (
                    <div
                      key={option.label}
                      className="flex flex-col items-center w-full"
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`communicatedEffectively-${option}`}
                      />
                      <Label
                        htmlFor={`communicatedEffectively-${option}`}
                        className="mt-1 text-center"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Question 4 */}
            <div>
              <Label className="block mb-2 text-sm font-medium">
                Were your ideas taken seriously by this person?
              </Label>
              <RadioGroup
                value={formData.ideasTakenSeriously}
                onValueChange={(value) =>
                  handleInputChange("ideasTakenSeriously", value)
                }
              >
                <div className="flex justify-between space-x-4">
                  {options.map((option) => (
                    <div
                      key={option.label}
                      className="flex flex-col items-center w-full"
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`ideasTakenSeriously-${option}`}
                      />
                      <Label
                        htmlFor={`ideasTakenSeriously-${option}`}
                        className="mt-1 text-center"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Question 5 */}
            <div>
              <Label className="block mb-2 text-sm font-medium">
                Has this person put in the appropriate time for the project?
              </Label>
              <RadioGroup
                value={formData.putInAppropriateTime}
                onValueChange={(value) =>
                  handleInputChange("putInAppropriateTime", value)
                }
              >
                <div className="flex justify-between space-x-4">
                  {options.map((option) => (
                    <div
                      key={option.label}
                      className="flex flex-col items-center w-full"
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`putInAppropriateTime-${option}`}
                      />
                      <Label
                        htmlFor={`putInAppropriateTime-${option}`}
                        className="mt-1 text-center"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Compatibility Section */}
            <h3 className="text-lg font-bold">Compatibility</h3>
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
            <h3 className="text-lg font-bold">Overall Score</h3>
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
            <h3 className="text-lg font-bold">Feedback</h3>
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
                placeholder="Optional feedback (max 250 characters)"
                maxLength={250}
                value={formData.improvementFeedback || ""}
                onChange={(e) =>
                  handleInputChange("improvementFeedback", e.target.value)
                }
                className="w-full"
              />
            </div>

            {/* Strength Area */}
            <div className="space-y-2">
              <Label htmlFor="strengthFeedback" className="text-sm font-medium">
                What is something this student has done particularly well on?
              </Label>
              <Textarea
                id="strengthFeedback"
                name="strengthFeedback"
                placeholder="Optional feedback (max 250 characters)"
                maxLength={250}
                value={formData.strengthFeedback || ""}
                onChange={(e) =>
                  handleInputChange("strengthFeedback", e.target.value)
                }
                className="w-full"
              />
            </div>

            {/* Flag Review */}
            <div className="space-y-2">
              <Label htmlFor="isFlagged" className="text-sm font-medium">
                Would you like to flag this review for the professor?{" "}
              </Label>
              <Checkbox
                id="flag"
                checked={formData.isFlagged}
                onCheckedChange={(checked) =>
                  handleInputChange("isFlagged", checked)
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground"
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
