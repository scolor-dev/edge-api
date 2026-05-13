import { Hono } from 'hono'
import publicRoutes from './public'
import adminRoutes from './admin'

const routes = new Hono<{ Bindings: CloudflareBindings }>()

routes.route('/', publicRoutes)
routes.route('/admin', adminRoutes)

export default routes