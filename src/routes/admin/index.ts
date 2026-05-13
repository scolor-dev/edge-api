import { Hono } from 'hono'
import projectRoute from './projectRoute'

const adminRoutes = new Hono<{ Bindings: CloudflareBindings }>()

adminRoutes.route('/projects', projectRoute)

export default adminRoutes