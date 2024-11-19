import { useState } from "react"
import { Button} from "../components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"

interface LoginFormData {
    email: string;
    password: string;
  }
  
  export default function Login() {
    // State to manage form data
    const [formData, setFormData] = useState<LoginFormData>({
      email: "",
      password: "",
    });
  
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    };
  
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      console.log("Login Data:", formData);
    };
  
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <Card className="w-full max-w-md p-6">
          <CardHeader className="text-center">
            <h2 className="text-2xl font-semibold">Login</h2>
            <p className="text-muted-foreground">Enter your credentials to access your account</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-input text-input-foreground"
                  required
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-input text-input-foreground"
                  required
                />
              </div>
              <CardFooter className="flex justify-between">
                <Button type="submit" className="bg-primary text-primary-foreground">
                  Login
                </Button>
                <Button type="button" variant="link" className="text-muted-foreground">
                  Forgot Password?
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  