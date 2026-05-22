export function getBase(platform: App.Platform | undefined): string {
	return platform?.env?.API_BASE_URL ?? "http://localhost:8787/api"
}

export function apiHeaders(locals: App.Locals): Record<string, string> {
	const headers: Record<string, string> = { "Content-Type": "application/json" }
	if (locals.accessJwt) headers["CF-Access-JWT-Assertion"] = locals.accessJwt
	return headers
}
