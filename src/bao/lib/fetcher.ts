export default async function fetcher(url: string, options?: any) {
	const res = await fetch(url, options)
	return res.json()
}
