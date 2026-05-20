import { Hono } from "hono"
import postRoute from "./postRoute"
import projectRoute from "./projectRoute"
import tagRoute from "./tagRoute"

const publicRoutes = new Hono<{ Bindings: CloudflareBindings }>()

publicRoutes.route("/tags", tagRoute)
publicRoutes.route("/projects", projectRoute)
publicRoutes.route("/posts", postRoute)

export default publicRoutes
