import { Link, useLocation } from "react-router-dom"
import { Card, CardContent } from "../components/ui/card"
import { CheckCircle, XCircle, ChevronRight } from 'lucide-react'

interface Student {
  id: string
  name: string
  computingId: string
  reviewCompleted: boolean
}

const students: Student[] = [
  { id: '1', name: 'John Doe', computingId: 'jd3fa', reviewCompleted: true },
  { id: '2', name: 'Jane Smith', computingId: 'js2fb', reviewCompleted: false },
  { id: '3', name: 'Bob Johnson', computingId: 'bj1fc', reviewCompleted: true },
  { id: '4', name: 'Alice Brown', computingId: 'ab4fd', reviewCompleted: false },
  { id: '5', name: 'Charlie White', computingId: 'cw5fe', reviewCompleted: true },
  { id: '6', name: 'Diana Green', computingId: 'dg6fg', reviewCompleted: false },
];

export default function SprintReviews() {
  const location = useLocation();
  const { sprint } = location.state || {};

  return (
    <div className="container mx-auto p-4 flex justify-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Sprint {sprint?.sprintNumber} - Submit reviews for your team members</h1>
        <div className="space-y-8">
          {students.map((student) => (
            <Link
              to={`/review/${student.id}`}
              state={{ student, sprint }}
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
                    {student.reviewCompleted ? (
                      <CheckCircle className="text-green-500 mr-2" />
                    ) : (
                      <XCircle className="text-red-500 mr-2" />
                    )}
                    <span className="mr-2">
                      {student.reviewCompleted ? 'Complete' : 'Incomplete'}
                    </span>
                    <ChevronRight className="text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
