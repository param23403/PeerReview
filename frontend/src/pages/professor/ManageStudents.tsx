import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { toast } from "../../hooks/use-toast";
import { Toaster } from "../../components/ui/toaster";
import { useNavigate, useLocation } from "react-router-dom";

export default function ManageStudents() {
  const navigate = useNavigate();
  const location = useLocation();
  const action = location.state?.action || "add"; //default to add student

  const [formData, setFormData] = useState(
    action === "add"
      ? {
          team: "",
          firstName: "",
          lastName: "",
          computingID: "",
          preferredPronouns: "",
          githubID: "",
          discordID: "",
        }
      : {
          computingID: "",
        }
  );

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const endpoint =
        action === "add"
          ? `${import.meta.env.VITE_BACKEND_URL}/students/add`
          : `${import.meta.env.VITE_BACKEND_URL}/students/remove`;
      const response = await axios.post(endpoint, data, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Student ${
          action === "add" ? "added" : "removed"
        } successfully!`,
        variant: "success",
        duration: 2000,
      });

      setFormData(
        action === "add"
          ? {
              team: "",
              firstName: "",
              lastName: "",
              computingID: "",
              preferredPronouns: "",
              githubID: "",
              discordID: "",
            }
          : {
              computingID: "",
            }
      );

      setTimeout(() => {
        navigate("/viewsprints");
      }, 2000);
    },

    onError: (error: unknown) => {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Unexpected error occurred.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      (action === "add" &&
        (!formData.team ||
          !formData.firstName ||
          !formData.lastName ||
          !formData.computingID)) ||
      (action === "remove" && !formData.computingID)
    ) {
      toast({
        title: "Error",
        description: "Please fill out all required fields.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    mutation.mutate(formData);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="bg-background text-foreground flex flex-col items-center py-12">
      <Card className="w-full max-w-2xl p-6">
        <Label
          htmlFor={action === "add" ? "addStudentForm" : "removeStudentForm"}
          className="block text-lg font-semibold mb-4"
        >
          {action === "add" ? "Add Student" : "Remove Student"}
        </Label>
        <form
          onSubmit={handleSubmit}
          id={action === "add" ? "addStudentForm" : "removeStudentForm"}
        >
          {action === "add" && (
            <>
              <Input
                name="team"
                placeholder="Team"
                value={formData.team}
                onChange={handleChange}
                className="mb-4"
              />
              <Input
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="mb-4"
              />
              <Input
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="mb-4"
              />
              <Input
                name="computingID"
                placeholder="Computing ID"
                value={formData.computingID}
                onChange={handleChange}
                className="mb-4"
              />
              <Input
                name="preferredPronouns"
                placeholder="Preferred Pronouns"
                value={formData.preferredPronouns}
                onChange={handleChange}
                className="mb-4"
              />
              <Input
                name="githubID"
                placeholder="GitHub ID"
                value={formData.githubID}
                onChange={handleChange}
                className="mb-4"
              />
              <Input
                name="discordID"
                placeholder="Discord ID"
                value={formData.discordID}
                onChange={handleChange}
                className="mb-4"
              />
            </>
          )}
          {action === "remove" && (
            <Input
              name="computingID"
              placeholder="Computing ID"
              value={formData.computingID}
              onChange={handleChange}
              className="mb-4"
            />
          )}
          <div className="flex justify-center items-center h-full">
            <Button type="submit" className="ce">
              {action === "add" ? "Save" : "Delete"}
            </Button>
          </div>
        </form>
      </Card>
      <Toaster />
    </div>
  );
}
