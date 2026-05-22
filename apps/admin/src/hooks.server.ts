import type { Handle } from "@sveltejs/kit"

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.accessJwt = event.request.headers.get("CF-Access-JWT-Assertion") ?? ""
	return resolve(event)
}
