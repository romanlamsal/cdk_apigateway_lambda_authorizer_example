import { JwtTokenHeader, JwtTokenPayload } from "../service/jwtTokenService"
import { Base64 } from "./base64Util"

export const parseJwtToken = function(token: string): { header: JwtTokenHeader, payload: JwtTokenPayload} {
    const [ header, payload ] = token.split(".")
        .slice(0, 2)
        .map(p => JSON.parse(Base64.deserialize(p)))
    return { header, payload }
}
