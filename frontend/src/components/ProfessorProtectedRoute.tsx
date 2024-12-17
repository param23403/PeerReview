import { Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../auth/useAuth"
import { useEffect } from "react"

const ProtectedRoute = () => {
	const { user, userData, loading } = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		if (!loading && (!user || userData?.role !== "professor")) {
			navigate("/login")
		}
	}, [user])

	return <Outlet />
}

export default ProtectedRoute
