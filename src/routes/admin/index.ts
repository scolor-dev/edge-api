import { Hono } from 'hono'

const adminRoutes = new Hono<{ Bindings: CloudflareBindings }>()

export default adminRoutes