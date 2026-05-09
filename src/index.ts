import { Hono } from 'hono'
import { logger } from 'hono/logger'
import routes from './routes'
import { errorHandler } from './middlewares/errorHandler'

const app = new Hono()

app.use('*', logger())
app.get('/health', (c) => c.json({ status: 'ok' }))
app.route('/api', routes)

app.onError(errorHandler)
app.notFound((c) => c.json({ message: 'Not Found' }, 404))

export default app