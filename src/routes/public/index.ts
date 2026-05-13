import { Hono } from 'hono'
import projectRoute from './projectRoute'

const publicRoutes = new Hono<{ Bindings: CloudflareBindings }>()

publicRoutes.route('/projects', projectRoute)

export default publicRoutes