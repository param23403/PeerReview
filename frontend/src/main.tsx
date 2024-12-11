import * as React from "react"
import * as ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import "./index.css"

import Layout from "./components/Layout"

import Login from "./pages/Login"
import Landing from "./pages/Landing"
import SignupStudent from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import StudentReviewForm from "./pages/StudentReviewForm"
import StudentSprints from "./pages/StudentSprints"
import SprintReviews from "./pages/SprintReviews"
import { AuthProvider } from "./auth/AuthContext"
import StudentProtectedRoute from "./components/StudentProtectedRoute"

const queryClient = new QueryClient();

const router = createBrowserRouter([
	{
		element: <Layout />,
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
				element: <StudentProtectedRoute />,
				children: [
					{
						path: "/dashboard",
						element: <Dashboard />,
					},
					{
						path: "/sprints",
						element: <StudentSprints />,
					},
					{
						path: "/sprints/:sprintId/reviews",
						element: <SprintReviews />,
					},
					{
						path: "/review/:studentId",
						element: <StudentReviewForm member={null} reviewSubmitted={false} />,
					},
				],
			},
		],
	},
])

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<RouterProvider router={router} />
			</AuthProvider>
		</QueryClientProvider>
	</React.StrictMode>
)
