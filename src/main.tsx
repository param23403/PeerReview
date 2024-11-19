import * as React from "react"
import * as ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import "./index.css"

import Layout from "./components/Layout"

import Login from "./pages/Login"
import Landing from "./pages/Landing"

const router = createBrowserRouter([
	{
		element: <Layout/>,
		children: [
			{
				path: "/test",
				element: <Landing/>
			},
			{
				path: "login",
				element: <Login/>
			},
		]
	},
])

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
)
