export const storage = {
  // テキスト取得（MD・JSON）
  async getText(bucket: R2Bucket, key: string): Promise<string | null> {
    const obj = await bucket.get(key)
    if (!obj) return null
    return await obj.text()
  },

  // テキスト保存（MD・JSON）
  async put(bucket: R2Bucket, key: string, data: string): Promise<void> {
    await bucket.put(key, data)
  },

  // 1ファイル削除
  async delete(bucket: R2Bucket, key: string): Promise<void> {
    await bucket.delete(key)
  },

  // プレフィックス配下を全削除
  async deleteAll(bucket: R2Bucket, prefix: string): Promise<void> {
    const result = await bucket.list({ prefix })
    await Promise.all(result.objects.map(obj => bucket.delete(obj.key)))
  },

  // 画像アップロード
  async putAsset(bucket: R2Bucket, key: string, data: ArrayBuffer, contentType: string): Promise<void> {
    await bucket.put(key, data, {
      httpMetadata: { contentType }
    })
  },

  // 画像取得
  async getAsset(bucket: R2Bucket, key: string): Promise<R2ObjectBody | null> {
    return await bucket.get(key)
  },
}