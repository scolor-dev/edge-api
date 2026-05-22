export function apiHeaders(locals: App.Locals): Record<string, string> {
	const headers: Record<string, string> = { "Content-Type": "application/json" }
	if (locals.accessJwt) headers["CF-Access-JWT-Assertion"] = locals.accessJwt
	return headers
}
