import { Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../auth/useAuth"
import { useEffect } from "react"

const StudentProtectedRoute = () => {
	const { user, userData, loading } = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		if (!loading && (!user || userData?.role !== "student")) {
			navigate("/login")
		}
	}, [user, userData])

	return <Outlet />
}

export default StudentProtectedRoute
