import express, { Router } from "express"
import serverless from "serverless-http"
import cors from "cors"

import authRouter from "../../src/routes/auth"
import teamsRouter from "../../src/routes/teams"

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

app.use("/.netlify/functions/api/auth", authRouter)
app.use("/.netlify/functions/api/teams", teamsRouter)

export const handler = serverless(app)
