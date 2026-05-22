import { Hono } from "hono"
import { accessAuth } from "../middlewares/accessAuth"
import adminRoutes from "./admin"
import publicRoutes from "./public"

const routes = new Hono<{ Bindings: CloudflareBindings }>()

routes.route("/", publicRoutes)
routes.use("/admin/*", accessAuth)
routes.route("/admin", adminRoutes)

export default routes
