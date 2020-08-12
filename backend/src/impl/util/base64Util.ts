const serialize = (obj: string) => Buffer.from(obj).toString("base64")
const deserialize = (base64String: string) => Buffer.from(base64String, "base64").toString()

export const Base64 = { serialize, deserialize }
