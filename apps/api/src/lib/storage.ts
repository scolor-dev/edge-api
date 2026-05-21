export const storage = {
	// === テキスト・MD ===

	/**
	 * テキストファイル取得（MD・txt）
	 */
	async getText(bucket: R2Bucket, key: string): Promise<string | null> {
		const obj = await bucket.get(key)
		if (!obj) return null
		return await obj.text()
	},

	/**
	 * テキストファイル保存（MD・txt）
	 */
	async putText(bucket: R2Bucket, key: string, data: string): Promise<void> {
		await bucket.put(key, data, {
			httpMetadata: { contentType: "text/plain; charset=utf-8" },
		})
	},

	// === JSON ===

	/**
	 * JSONファイル取得（パースして返す）
	 */
	async getJson<T = unknown>(bucket: R2Bucket, key: string): Promise<T | null> {
		const obj = await bucket.get(key)
		if (!obj) return null
		const text = await obj.text()
		return JSON.parse(text) as T
	},

	/**
	 * JSONファイル保存（オブジェクトを受け取ってシリアライズ）
	 */
	async putJson(bucket: R2Bucket, key: string, data: unknown): Promise<void> {
		await bucket.put(key, JSON.stringify(data), {
			httpMetadata: { contentType: "application/json" },
		})
	},

	// === 画像・バイナリ ===

	/**
	 * 画像取得
	 */
	async getAsset(bucket: R2Bucket, key: string): Promise<R2ObjectBody | null> {
		return await bucket.get(key)
	},

	/**
	 * 画像保存
	 */
	async putAsset(
		bucket: R2Bucket,
		key: string,
		data: ArrayBuffer,
		contentType: string,
	): Promise<void> {
		await bucket.put(key, data, {
			httpMetadata: { contentType },
		})
	},

	// === 共通 ===

	/**
	 * ファイル削除
	 */
	async delete(bucket: R2Bucket, key: string): Promise<void> {
		await bucket.delete(key)
	},

	/**
	 * プレフィックス配下を全削除
	 */
	async deleteAll(bucket: R2Bucket, prefix: string): Promise<void> {
		const result = await bucket.list({ prefix })
		await Promise.all(result.objects.map((obj) => bucket.delete(obj.key)))
	},

	/**
	 * プレフィックス配下を全コピー
	 */
	async copyAll(bucket: R2Bucket, oldPrefix: string, newPrefix: string): Promise<void> {
		const result = await bucket.list({ prefix: oldPrefix })
		await Promise.all(
			result.objects.map(async (obj) => {
				const content = await bucket.get(obj.key)
				if (!content) return
				const newKey = obj.key.replace(oldPrefix, newPrefix)
				await bucket.put(newKey, await content.arrayBuffer())
			}),
		)
	},
}
