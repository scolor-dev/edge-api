import { createMiddleware } from "hono/factory"
import { createRemoteJWKSet, jwtVerify } from "jose"

export const accessAuth = createMiddleware<{ Bindings: CloudflareBindings }>(async (c, next) => {
	const aud = c.env.CF_ACCESS_AUD as string
	const teamDomain = c.env.CF_TEAM_DOMAIN as string

	// Skip verification in local dev (env vars not set)
	if (!aud || !teamDomain) {
		await next()
		return
	}

	const token = c.req.header("CF-Access-JWT-Assertion")
	if (!token) {
		return c.json({ error: "Unauthorized" }, 401)
	}

	try {
		const JWKS = createRemoteJWKSet(
			new URL(`https://${teamDomain}.cloudflareaccess.com/cdn-cgi/access/certs`),
		)
		await jwtVerify(token, JWKS, { audience: aud })
		await next()
	} catch {
		return c.json({ error: "Unauthorized" }, 401)
	}
})
