import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../components/ui/card";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
interface SignUpFormData {
  firstName: string;
  lastName: string;
  computingId: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUp() {
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: "",
    lastName: "",
    computingId: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const db = getFirestore();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.email !== `${formData.computingId}@virginia.edu`) {
      setError("Email should be in the format computingid@virginia.edu");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Update the user's uid to match the computingId
      await updateProfile(userCredential.user, {
        displayName: `${formData.firstName} ${formData.lastName}`,
      });

      // Create a user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: "student",
        createdAt: new Date(),
      });

      navigate("/login");
    } catch (error) {
      setError("Failed to create an account. Please try again.");
      console.error("Error signing up:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <Card className="w-full max-w-md p-6">
        <CardHeader className="text-center">
          <h2 className="text-2xl font-semibold">Sign Up</h2>
          <p className="text-muted-foreground">
            Create your account to get started
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-input text-input-foreground"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-input text-input-foreground"
                />
              </div>
              <div>
                <Label htmlFor="computingId">Computing ID</Label>
                <Input
                  id="computingId"
                  type="text"
                  required
                  value={formData.computingId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-input text-input-foreground"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-input text-input-foreground"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-input text-input-foreground"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-input text-input-foreground"
                />
              </div>
            </div>
            <CardFooter className="flex justify-between mt-6">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground"
              >
                Sign Up
              </Button>
              <Button
                type="button"
                variant="link"
                className="text-muted-foreground"
                onClick={() => navigate("/login")}
              >
                Already have an account?
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
