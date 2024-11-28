import React, { createContext, useState, useEffect, ReactNode } from "react"
import { User, onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

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
			const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/getUser/${user.uid}`)
			return response.data
		},
		enabled: !!user?.uid,
	})

	const loading = loadingAuth || loadingUserData

	return <AuthContext.Provider value={{ user, userData, loading }}>{children}</AuthContext.Provider>
}
