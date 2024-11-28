import { Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../auth/useAuth"
import { useEffect } from "react"

const StudentProtectedRoute = () => {
	const { user, userData, loading } = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		if (!user && !loading && userData?.role !== "student") {
			navigate("/login")
		}
	}, [user])

	return <Outlet />
}

export default StudentProtectedRoute
