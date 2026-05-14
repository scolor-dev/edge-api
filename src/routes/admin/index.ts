import { Hono } from 'hono'
import adminProjectRoute from './projectRoute'

const adminRoutes = new Hono<{ Bindings: CloudflareBindings }>()

adminRoutes.route('/projects', adminProjectRoute)

export default adminRoutes