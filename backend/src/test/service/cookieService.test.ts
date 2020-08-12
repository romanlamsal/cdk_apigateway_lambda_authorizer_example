import { parseCookieString } from "../../impl/service/cookieService"

describe("parseCookieString", () => {
    it("should parse cookie from cookie string with trailing whitespaces", () => {
        // given
        const cookieString = "foo=bar; bar=baz;baz=foo ;"

        // when
        const parsed = parseCookieString(cookieString)

        // then
        expect(parsed).toEqual({
            foo: "bar",
            bar: "baz",
            baz: "foo"
        })
    })
    it("should parse cookie from cookie string with whitespaces around '=' sign", () => {
        // given
        const cookieString = "foo =bar;bar= baz;baz = foo;"

        // when
        const parsed = parseCookieString(cookieString)

        // then
        expect(parsed).toEqual({
            foo: "bar",
            bar: "baz",
            baz: "foo"
        })
    })
    it("should parse cookie from cookie string with equals in cookie value", () => {
        // given
        const cookieString = "foo =bar/=="

        // when
        const parsed = parseCookieString(cookieString)

        // then
        expect(parsed).toEqual({
            foo: "bar/=="
        })
    })
})
