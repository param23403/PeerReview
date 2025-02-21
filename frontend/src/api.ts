import axios from "axios"
import { auth } from "./firebase"

const api = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_URL,
})

api.interceptors.request.use(async (config) => {
	if (!config.headers["Skip-Auth"]) {
		const user = auth.currentUser
		if (user) {
			const token = await user.getIdToken()
			config.headers.Authorization = `Bearer ${token}`
		}
	}

	delete config.headers["Skip-Auth"]
	return config
})

export default api
