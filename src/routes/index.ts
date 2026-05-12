import { Hono } from 'hono'
// import userRoute from './userRoute'
// import postRoute from './postRoute'

const routes = new Hono()

// routes.route('/users', userRoute)
// routes.route('/posts', postRoute)

// Public Health
routes.get('/health', (c) =>
  c.json({
    status: 'ok',
    scope: 'api-public',
  })
)

// Admin Health
routes.get('/admin/health', (c) => {
  const email = c.req.header(
    'cf-access-authenticated-user-email'
  )

  return c.json({
    status: 'ok',
    scope: 'admin',
    authenticated: !!email,
    email: email ?? null,
  })
})

export default routes