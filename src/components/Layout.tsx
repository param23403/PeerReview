import Navbar from "./Navbar"
import { Outlet } from "react-router-dom"

const Layout = () => {
	return (
		<>
			<Navbar />
			<main className="pt-24">
				<Outlet />
			</main>
		</>
	)
}

export default Layout
