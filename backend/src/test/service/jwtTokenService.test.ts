import { createToken, JwtTokenInput, validateToken } from "../../impl/service/jwtTokenService"

describe("createToken", () => {
    it("should set correct header", async () => {
        // given
        // payload and sign don't matter here as header is always fixed

        // when
        const headerBase64 = (await createToken({ username: "the_incredible_bulk" }, () => Promise.resolve(""))).split(".")[0]
        const header = JSON.parse(Buffer.from(headerBase64, "base64").toString())

        // then
        expect(header).toEqual({ typ: "jwt" })
    })

    it("should set correct body from payload", async () => {
        // given
        const givenPayload: JwtTokenInput = { username: "the_incredible_bulk" }

        // when
        const payloadBase64 = (await createToken(givenPayload, () => Promise.resolve("foo"))).split(".")[1]
        const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString())

        // then
        expect(payload).toEqual({
            sub: givenPayload.username,
            iss: process.env.ISSUER!!,
            exp: new Date("9999-01-01").toISOString()
        })
    })

    it("should sign token based on header and payload", async () => {
        // given
        const sign = jest.fn((s: string) => Promise.resolve(s))

        // when
        const [headerBase64, payloadBase64] = (await createToken({ username: "the_credible_bulk" }, sign)).split(".")

        // then
        expect(sign).toBeCalledWith(headerBase64 + "." + payloadBase64)
    })
})

describe("validateToken", () => {
    it("should call verify with header.payload and signature", async () => {
        // given
        const verify = jest.fn()
        const tokenBody = "foo.bar"
        const signature = "baz"

        // when
        await validateToken(tokenBody + "." + signature, verify)

        // then
        expect(verify).toBeCalledWith(tokenBody, signature)
    })
})
