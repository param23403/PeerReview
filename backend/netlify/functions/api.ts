import "dotenv/config"
import express from "express"
import serverless from "serverless-http"
import cors from "cors"

import authRouter from "../../src/routes/auth"
import sprintRouter from "../../src/routes/sprints"
import teamRouter from "../../src/routes/teams"

const app = express()

app.use(
	cors({
		origin: "*",
		credentials: false,
		methods: "GET,HEAD,OPTIONS,POST,PUT,DELETE",
		allowedHeaders:
			"Origin,Accept,X-Requested-With,Content-Type,Access-Control-Request-Method,Access-Control-Request-Headers,Access-Control-Allow-Origin,Authorization",
	})
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/auth", authRouter)
app.use("/api/sprints", sprintRouter)
app.use("/api/teams", teamRouter)

export const handler = serverless(app)

if (process.env.NODE_ENV !== "production") {
	const PORT = process.env.PORT || 8888
	app.listen(PORT, () => {
		console.log(`Local server running at http://localhost:${PORT}`)
	})
}
