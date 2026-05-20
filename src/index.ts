import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { errorHandler } from "./middlewares/errorHandler"
import routes from "./routes"

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.use("*", logger())
app.use(
	"*",
	cors({
		origin: (origin, c) => {
			const allowed = c.env.ALLOWED_ORIGIN.split(",").map((o) => o.trim())
			return allowed.includes(origin) ? origin : null
		},
		allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
		allowHeaders: ["Content-Type", "Authorization"],
		maxAge: 86400,
	}),
)

app.get("/health", (c) => c.json({ status: "ok", scope: "public" }))
app.route("/api", routes)

app.onError(errorHandler)
app.notFound((c) => c.json({ message: "Not Found" }, 404))

export default app
