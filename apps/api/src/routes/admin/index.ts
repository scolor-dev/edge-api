import { Hono } from "hono"
import adminPostRoute from "./postRoute"
import adminProjectRoute from "./projectRoute"
import adminTagRoute from "./tagRoute"

const adminRoutes = new Hono<{ Bindings: CloudflareBindings }>()

adminRoutes.route("/tags", adminTagRoute)
adminRoutes.route("/projects", adminProjectRoute)
adminRoutes.route("/posts", adminPostRoute)

export default adminRoutes
