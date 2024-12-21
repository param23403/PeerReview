import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from "../../constants";

interface Student {
  id: string;
  name: string;
  computingId: string;
  reviewCompleted: boolean;
}

interface Review {
  id: string;
  reviewerId: string;
  sprintId: string;
  reviewedTeammateId: string;
}

export default function SprintReviews() {
  const location = useLocation();
  const { sprint, reviewerId } = location.state || {};

  const [students, setStudents] = useState<Student[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Fetch reviews from the backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/${reviewerId}/${sprint.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }
        const reviewsData: Review[] = await response.json();
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    if (sprint?.id && reviewerId) fetchReviews();
  }, [sprint, reviewerId]);

  // Fetch students (mocked here)
  useEffect(() => {
    const studentsData: Student[] = [
      { id: '1', name: 'John Doe', computingId: 'jd3fa', reviewCompleted: false },
      { id: '2', name: 'Jane Smith', computingId: 'js2fb', reviewCompleted: false },
      { id: '3', name: 'Bob Johnson', computingId: 'bj1fc', reviewCompleted: false },
      { id: '4', name: 'Alice Brown', computingId: 'ab4fd', reviewCompleted: false },
      { id: '5', name: 'Charlie White', computingId: 'cw5fe', reviewCompleted: false },
      { id: '6', name: 'Diana Green', computingId: 'dg6fg', reviewCompleted: false },
    ];
    setStudents(studentsData);
  }, []);

  return (
    <div className="container mx-auto p-4 flex justify-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Sprint {sprint?.id} - Submit reviews for your team members
        </h1>
        <div className="space-y-8">
          {students.map((student) => {
            const reviewCompleted = reviews.some(
              (review) => review.reviewedTeammateId === student.id
            );
            return (
              <Link
                to={`/review/${student.id}`}
                state={{ student, sprint, reviewCompleted }}
                key={student.id}
                className="block hover:shadow-lg transition-shadow duration-200"
              >
                <Card>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h2 className="font-semibold">{student.name}</h2>
                      <p className="text-sm text-gray-500">({student.computingId})</p>
                    </div>
                    <div className="flex items-center">
                      {reviewCompleted ? (
                        <CheckCircle className="text-green-500 mr-2" />
                      ) : (
                        <XCircle className="text-red-500 mr-2" />
                      )}
                      <span className="mr-2">
                        {reviewCompleted ? 'Submitted' : 'Incomplete'}
                      </span>
                      <ChevronRight className="text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
