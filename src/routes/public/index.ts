import { Hono } from 'hono'

const publicRoutes = new Hono<{ Bindings: CloudflareBindings }>()

export default publicRoutes