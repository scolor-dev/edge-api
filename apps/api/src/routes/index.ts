import { Hono } from "hono"
import adminRoutes from "./admin"
import publicRoutes from "./public"

const routes = new Hono<{ Bindings: CloudflareBindings }>()

routes.route("/", publicRoutes)
routes.route("/admin", adminRoutes)

export default routes
