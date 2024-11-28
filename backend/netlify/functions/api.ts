import express, { Router } from "express"
import serverless from "serverless-http"
import cors from "cors"

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

const router = Router()

export const handler = serverless(app)
