export interface JwtTokenInput {
    username: string
}

export interface JwtTokenHeader {
    typ: "jwt"
}

export interface JwtTokenPayload {
    sub: string,
    iss: string,
    exp: string
}

type JwtToken = string

export async function createToken(payload: JwtTokenInput, sign: (unsignedToken: string) => Promise<string>) {
    const header: JwtTokenHeader = { typ: "jwt" }
    const tokenPayload: JwtTokenPayload = {
        sub: payload.username,
        iss: process.env.ISSUER!!,
        exp: new Date("9999-01-01").toISOString()
    }
    const hashed = [header, tokenPayload]
        .map(p => Buffer.from(JSON.stringify(p)).toString("base64"))
        .join(".")
    return hashed + "." + await sign(hashed)
}

// TODO: check expiration date
export function validateToken(token: JwtToken, verify: (message: string, signature: string) => Promise<boolean>) {
    const [headerBase64, payloadBase64, signature] = token.split(".")
    return verify(headerBase64 + "." + payloadBase64, signature)
}

export const JwtTokenService = {
    createToken,
    validateToken
}
