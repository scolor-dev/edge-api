import { Hono } from 'hono'
import { projectService } from '../../services/projects'

const projectRoute = new Hono<{ Bindings: CloudflareBindings }>()

export default projectRoute