import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "../../components/ui/button";
import { Calendar } from "../../components/ui/calendar";
import { Toaster } from "../../components/ui/toaster";
import { toast } from "../../hooks/use-toast";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { cn } from "../../lib/utils";

interface SprintData {
  name: string;
  reviewDueDate: Date;
  sprintDueDate: Date;
}

export default function EditSprint() {
  const { sprintId } = useParams<{ sprintId: string }>();
  const { loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      reviewDueDate: undefined as Date | undefined,
      sprintDueDate: undefined as Date | undefined,
    },
  });

  useEffect(() => {
    if (!authLoading) {
      const fetchSprint = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/sprints/getSprint/${sprintId}`
          );

          if (!response.ok) throw new Error("Failed to fetch sprint");

          const sprintData: SprintData = await response.json();
          reset({
            name: sprintData.name,
            reviewDueDate: new Date(
              sprintData.reviewDueDate?._seconds * 1000 || Date.now()
            ),
            sprintDueDate: new Date(
              sprintData.sprintDueDate?._seconds * 1000 || Date.now()
            ),
          });

          setLoading(false);
        } catch (err) {
          console.error("Error:", err);
          setError("Failed to load sprint data");
          setLoading(false);
        }
      };

      fetchSprint();
    }
  }, [authLoading, sprintId, reset]);

  const onSubmit = async (data: {
    name: string;
    reviewDueDate?: Date;
    sprintDueDate?: Date;
  }) => {
    try {
      if (!data.name || !data.reviewDueDate || !data.sprintDueDate) {
        toast({
          title: "Error",
          description: "All Fields are required",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      if (data.reviewDueDate <= data.sprintDueDate) {
        toast({
          title: "Error",
          description: "Review due date must be after sprint due date",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      const payload = {
        name: data.name,
        reviewDueDate: data.reviewDueDate,
        sprintDueDate: data.sprintDueDate,
        sprintId: sprintId,
      };
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/sprints/updateSprint`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
      }

      toast({
        title: "Success",
        description: "Sprint updated successfully!",
        variant: "success",
        duration: 3000,
      });
    } catch (err) {
      console.error("Error:", err);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading sprint data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const handleBackClick = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Button onClick={handleBackClick}>Back</Button>
      <br />
      <br />
      <h2 className="text-2xl font-bold mb-6">Edit Sprint {sprintId}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Sprint Name</label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter sprint name"
              />
            )}
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Review Due Date
            </label>
            <Controller
              name="reviewDueDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a review due date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Sprint Due Date
            </label>
            <Controller
              name="sprintDueDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a sprint due date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Save Changes
        </button>
      </form>
      <Toaster />
    </div>
  );
}
