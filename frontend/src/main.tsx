import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";

import Layout from "./components/Layout";

import Login from "./pages/Login";
import Landing from "./pages/Landing";
import SignupStudent from "./pages/Signup";
import StudentSprints from "./pages/student/StudentSprints";
import { AuthProvider } from "./auth/AuthContext";
import StudentProtectedRoute from "./components/StudentProtectedRoute";
import ProfessorProtectedRoute from "./components/ProfessorProtectedRoute";
import ProfessorDashboard from "./pages/professor/ProfessorDashboard";
import Students from "./pages/professor/Students";
import Teams from "./pages/professor/Teams";
import TeamPage from "./pages/professor/TeamPage";
import ManageStudents from "./pages/professor/ManageStudents";
import SprintReviews from "./pages/student/SprintReviews";
import SprintReviewForm from "./pages/student/SprintReviewForm";
import Reviews from "./pages/professor/Reviews";
import ProfessorSignUp from "./pages/Professor-signup";
import PublicRoute from "./components/PublicRoute";
import ManageSprints from "./pages/professor/ManageSprints";
import EditSprint from "./pages/professor/EditSprint";
import StudentSprintView from "./pages/professor/StudentSprintView";
import ChooseSprint from "./pages/professor/ChooseSprint";
import ReviewView from "./pages/professor/ReviewView";
import Sprints from "./pages/professor/Sprints";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        element: <PublicRoute />,
        children: [
          {
            path: "/",
            element: <Landing />,
          },
          {
            path: "/login",
            element: <Login />,
          },
          {
            path: "/signup-student",
            element: <SignupStudent />,
          },
          {
            path: "/signup-professor",
            element: <ProfessorSignUp />,
          },
        ],
      },
      {
        element: <StudentProtectedRoute />,
        children: [
          {
            path: "/sprints",
            element: <StudentSprints />,
          },
          {
            path: "/sprints/:sprintId/reviews",
            element: <SprintReviews />,
          },
          {
            path: "/review/:reviewerId/:reviewedTeammateId",
            element: <SprintReviewForm />,
          },
        ],
      },
      {
        element: <ProfessorProtectedRoute />,
        children: [
          {
            path: "/professor-dashboard",
            element: <ProfessorDashboard />,
          },
          {
            path: "/manage-students",
            element: <ManageStudents />,
          },
          {
            path: "/students",
            element: <Students />,
          },
          {
            path: "/reviews",
            element: <Reviews />,
          },
          {
            path: "/viewsprints",
            element: <Sprints />,
          },
          {
            path: "/sprint/:sprintId",
            element: <Teams />,
          },
          {
            path: "/sprint/:sprintId/teams/:teamId",
            element: <TeamPage />,
          },
          {
            path: "/settings",
            element: <ManageSprints />,
          },
          {
            path: "/edit-sprint/:sprintId",
            element: <EditSprint />,
          },
          {
            path: "/student/:computingID",
            element: <ChooseSprint />,
          },
          {
            path: "/student/:computingID/:sprintId",
            element: <StudentSprintView />,
          },
          {
            path: "/review/:reviewId",
            element: <ReviewView />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
