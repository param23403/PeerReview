import * as React from "react"
import * as ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import "./index.css"
import Navbar from "./components/Navbar"
import Login from "./pages/Login"

const router = createBrowserRouter([
	{
		element: <Navbar/>,
		children: [
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
