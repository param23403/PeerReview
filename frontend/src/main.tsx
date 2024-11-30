import * as React from "react"
import * as ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import "./index.css"

import Layout from "./components/Layout"

import Login from "./pages/Login"
import Landing from "./pages/Landing"
import SignUp from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import { AuthProvider } from "./auth/AuthContext"
import StudentProtectedRoute from "./components/StudentProtectedRoute"
import ProfessorProtectedRoute from "./components/ProfessorProtectedRoute"
import ProfessorDashboard from "./pages/ProfessorDashboard"
import TeamCreation from "./pages/TeamCreation"

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
				path: "/signup",
				element: <SignUp />,
			},
			{
				element: <StudentProtectedRoute />,
				children: [
					{
						path: "/dashboard",
						element: <Dashboard />,
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
						path: "/team-creation",
						element: <TeamCreation />,
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
