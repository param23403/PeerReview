import React, { createContext, useState, useEffect, ReactNode } from "react"
import { User, onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase"
import { useQuery } from "@tanstack/react-query"
import api from "../api"

interface UserData {
	displayName?: string
	email?: string
	role?: string
	[key: string]: any
}

interface AuthContextType {
	user: User | null
	userData: UserData | null
	loading: boolean
}

export const AuthContext = createContext<AuthContextType>({
	user: null,
	userData: null,
	loading: true,
})

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null)
	const [loadingAuth, setLoadingAuth] = useState(true)

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser)
			setLoadingAuth(false)
		})

		return () => unsubscribe()
	}, [])

	const { data: userData, isLoading: loadingUserData } = useQuery({
		queryKey: ["userData", user?.uid],
		queryFn: async () => {
			if (!user?.uid) return null
			const response = await api.get(`/auth/getUser/${user.uid}`, {
				headers: { "Skip-Auth": "true" },
			})
			return response.data
		},
		enabled: !!user?.uid,
	})

	useEffect(() => {
		const deleteUserIfNoData = async () => {
			if (user && userData === null && !loadingUserData) {
				try {
					await user.delete()
					setUser(null)
				} catch (error) {
					console.error("Error deleting user:", error)
				}
			}
		}

		deleteUserIfNoData()
	}, [user, userData, loadingUserData])

	const loading = loadingAuth || loadingUserData

	return <AuthContext.Provider value={{ user, userData, loading }}>{children}</AuthContext.Provider>
}
