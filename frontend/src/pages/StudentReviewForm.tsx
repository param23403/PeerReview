import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group"
import { toast } from "../hooks/use-toast"
import { Toaster } from "../components/ui/toaster"
import { ArrowLeft } from "lucide-react"

interface Member {
  id: string;
  name: string;
  computingId: string;
}

// Define the props for PeerReviewForm
interface PeerReviewFormProps {
  member: Member | null;
  reviewSubmitted: boolean;
}

const options = ["Never", "Rarely", "Sometimes", "Usually", "Always"];

export default function PeerReviewForm({ member }: PeerReviewFormProps) {
  if (!member) {
    return <div>No member data available.</div>;
  }

  const location = useLocation();
  const navigate = useNavigate();
  const { student, sprint } = location.state || {};

  const [reviewSubmitted, setReviewSubmitted] = useState(false); 

  interface FormData {
    hasKeptUpWithResponsibilities: string;
    hasHelpedTeamMembers: string;
    hasCommunicatedEffectively: string;
    ideasTakenSeriously: string;
    hasPutInAppropriateTime: string;
    compatibility: string;
    overallEvaluationScore: string;
  }
  
  const [formData, setFormData] = useState<FormData>({
    hasKeptUpWithResponsibilities: '',
    hasHelpedTeamMembers: '',
    hasCommunicatedEffectively: '',
    ideasTakenSeriously: '',
    hasPutInAppropriateTime: '',
    compatibility: '',
    overallEvaluationScore: '',
  });

  const handleBack = () => {
    navigate(`/sprints/${sprint.id}/reviews`, { state: { sprint }});
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (Object.values(formData).includes('')) {
      toast({
        title: "Error",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    setReviewSubmitted(true);
    toast({
      title: "Success",
      description: `Review for ${member.name} submitted successfully!`,
      variant: "success",
      duration: 3000,
    });
    console.log("Submitted Data:", formData);
  }

  if (reviewSubmitted) {
    return (
      <div className="container mx-auto p-4 flex justify-center bg-background text-foreground">
        <Card className="w-full max-w-2xl shadow-md border border-muted">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="text-green-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-center">Review Already Submitted</h2>
            <p className="text-lg mb-4 text-center">A review has already been submitted for {member.name}.</p>
            <p className="text-center mb-4">Would you like to go back and change it?</p>
            <Button variant="outline" onClick={() => {/* Add logic to go back */}}>
              Go Back and Change
            </Button>
          </CardContent>
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
            <CardTitle className="text-center text-xl font-semibold">Team Member Evaluation</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Evaluate your team member: {student.name} (ID: {student.computingId}) - Sprint {sprint.sprintNumber}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold">Evaluation</h3>
            {/* Question 1 */}
            <div>
              <Label className="block mb-2 text-sm font-medium">
                Has this person kept up with their role responsibilities? (Scrum Master, DevOps, Testing, Reqs)
              </Label>
              <RadioGroup
                value={formData.hasKeptUpWithResponsibilities}
                onValueChange={(value) =>
                  handleInputChange("hasKeptUpWithResponsibilities", value)
                }
              >
                <div className="flex justify-between space-x-4">
                  {options.map((option) => (
                    <div key={option} className="flex flex-col items-center w-full">
                      <RadioGroupItem value={option} id={`hasKeptUpWithResponsibilities-${option}`} />
                      <Label
                        htmlFor={`hasKeptUpWithResponsibilities-${option}`}
                        className="mt-1 text-center"
                      >
                        {option}
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
                value={formData.hasHelpedTeamMembers}
                onValueChange={(value) =>
                  handleInputChange("hasHelpedTeamMembers", value)
                }
              >
                <div className="flex justify-between space-x-4">
                  {options.map((option) => (
                    <div key={option} className="flex flex-col items-center w-full">
                      <RadioGroupItem value={option} id={`hasHelpedTeamMembers-${option}`} />
                      <Label
                        htmlFor={`hasHelpedTeamMembers-${option}`}
                        className="mt-1 text-center"
                      >
                        {option}
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
                value={formData.hasCommunicatedEffectively}
                onValueChange={(value) =>
                  handleInputChange("hasCommunicatedEffectively", value)
                }
              >
                <div className="flex justify-between space-x-4">
                  {options.map((option) => (
                    <div key={option} className="flex flex-col items-center w-full">
                      <RadioGroupItem value={option} id={`hasCommunicatedEffectively-${option}`} />
                      <Label
                        htmlFor={`hasCommunicatedEffectively-${option}`}
                        className="mt-1 text-center"
                      >
                        {option}
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
                    <div key={option} className="flex flex-col items-center w-full">
                      <RadioGroupItem value={option} id={`ideasTakenSeriously-${option}`} />
                      <Label
                        htmlFor={`ideasTakenSeriously-${option}`}
                        className="mt-1 text-center"
                      >
                        {option}
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
                value={formData.hasPutInAppropriateTime}
                onValueChange={(value) =>
                  handleInputChange("hasPutInAppropriateTime", value)
                }
              >
                <div className="flex justify-between space-x-4">
                  {options.map((option) => (
                    <div key={option} className="flex flex-col items-center w-full">
                      <RadioGroupItem value={option} id={`hasPutInAppropriateTime-${option}`} />
                      <Label
                        htmlFor={`hasPutInAppropriateTime-${option}`}
                        className="mt-1 text-center"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Compatibility Section */}
            <h3 className="text-lg font-semibold">Compatibility</h3>
            <RadioGroup
              value={formData.compatibility}
              onValueChange={(value) =>
                handleInputChange("compatibility", value)
              }
            >
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Not at all compatible</Label>
                <div className="flex justify-between items-center flex-grow">
                  {["1", "2", "3", "4", "5"].map((option) => (
                    <div key={option} className="flex flex-col items-center flex-grow">
                      <RadioGroupItem value={option} id={`compatibility-${option}`} />
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
            <h3 className="text-lg font-semibold">Overall Evaluation Score</h3>
            <RadioGroup
              value={formData.overallEvaluationScore}
              onValueChange={(value) =>
                handleInputChange("overallEvaluationScore", value)
              }
            >
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Active hindrance to team</Label>
                <div className="flex justify-between items-center flex-grow">
                  {["1", "2", "3", "4", "5"].map((option) => (
                    <div key={option} className="flex flex-col items-center flex-grow">
                      <RadioGroupItem value={option} id={`compatibility-${option}`} />
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
            <Button type="submit" className="w-full bg-primary text-primary-foreground">
              Submit Evaluation
            </Button>
          </form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );  
}
