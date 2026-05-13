export const storage = {
  // === MD（SCD_CONTENTS）===
  async getText(bucket: R2Bucket, key: string): Promise<string | null> {
    const obj = await bucket.get(key)
    if (!obj) return null
    return await obj.text()
  },

  async put(bucket: R2Bucket, key: string, data: string): Promise<void> {
    await bucket.put(key, data)
  },

  async delete(bucket: R2Bucket, key: string): Promise<void> {
    await bucket.delete(key)
  },

  async exists(bucket: R2Bucket, key: string): Promise<boolean> {
    const obj = await bucket.head(key)
    return obj !== null
  },

  // === 画像（SCD_ASSETS）===
  async putAsset(bucket: R2Bucket, key: string, data: ArrayBuffer, contentType: string): Promise<void> {
    await bucket.put(key, data, {
      httpMetadata: { contentType }
    })
  },

  async getAsset(bucket: R2Bucket, key: string): Promise<R2ObjectBody | null> {
    return await bucket.get(key)
  },

  async deleteAsset(bucket: R2Bucket, key: string): Promise<void> {
    await bucket.delete(key)
  },
}