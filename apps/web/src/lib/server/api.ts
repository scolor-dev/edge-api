export function getBase(platform: App.Platform | undefined): string {
	return platform?.env?.API_BASE_URL ?? 'http://localhost:8787/api'
}
