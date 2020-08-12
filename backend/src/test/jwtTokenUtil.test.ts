import { JwtTokenHeader } from "../impl/service/jwtTokenService"
import { parseJwtToken } from "../impl/util/jwtTokenUtil"
import { Fixtures } from "./Fixtures"

describe("parseJwtToken", () => {
    it("should parse username from token", () => {
        // given
        const token = Fixtures.token()

        // when
        const username = parseJwtToken(token).payload.sub

        // then
        expect(username).toEqual(Fixtures.username())
    })
})
