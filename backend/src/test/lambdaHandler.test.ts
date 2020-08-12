import { wrapController } from "../lambdaHandler"
import { LambdaController } from "../types/LambdaHandler"
import { Fixtures } from "./Fixtures"

describe("wrapController", () => {
    describe("Event to Args", () => {
        describe("Parse user from cookie", () => {
            test.each([
                "cookie",
                "Cookie"
            ])("should parse auth token from from header.%s", async (headerKey) => {
                // given
                const jwtToken = Fixtures.token()
                const event = {
                    headers: {
                        [headerKey]: "auth_token=" + jwtToken
                    }
                }
                const controller = jest.fn(() => Promise.resolve({ ok: true }))
                const wrapped = Fixtures.wrapWithDefaults(controller)

                // when
                await wrapped(event)

                // then
                expect(controller).toBeCalledWith({
                    user: {
                        jwtToken,
                        username: Fixtures.username()
                    }
                }, expect.anything())
            })
        })

        test.each([
            [ "no header is given", undefined ],
            [ "header is empty", {} ],
            [ "cookie has no auth_token", { cookie: "foo=bar" } ],
            // @ts-ignore
        ])("should leave user as undefined when %s", async (_, headers: any) => {
            // given
            const event = {
                headers
            }
            const controller = jest.fn(() => Promise.resolve({ ok: true }))
            const wrapped = Fixtures.wrapWithDefaults(controller)

            // when
            await wrapped(event)

            // then
            expect(controller).toBeCalledWith({ user: undefined }, expect.anything())
        })

        describe("Parse event.body", () => {
            test.each([
                [ "string", JSON.stringify ],
                [ "object", (v: any) => v ],
            ] as [ string, (v: any) => Object ][])("should parse body from %s to json", async (_, transform) => {
                // given
                const body = { foo: { bar: "baz" }, foobar: true, barbaz: 1337 }
                const event = { body: transform(body) }
                const controller = jest.fn(() => Promise.resolve({ ok: true }))
                const wrapped = Fixtures.wrapWithDefaults(controller)

                // when
                await wrapped(event)

                // then
                expect(controller).toBeCalledWith({ body }, expect.anything())
            })
        })
    })

    describe("Return to Response", () => {
        test.each([
            [ true, 200 ],
            [ false, 400 ]
        ] as [ boolean, number ][])("should map return.ok=%s to response.statusCode=%d", async (ok, statusCode) => {
            // given
            const controller: LambdaController = () => Promise.resolve({ ok })
            const wrapped = Fixtures.wrapWithDefaults(controller)

            // when
            const response = await wrapped({})

            // then
            expect(response).toEqual({
                statusCode,
                headers: {
                    "Access-Control-Allow-Origin": process.env.ORIGIN!!,
                    "Access-Control-Allow-Credentials": "true"
                }
            })
        })
        it("should map return.authToken to response.headers.set-cookie", async () => {
            // given
            const authToken = Fixtures.token()
            const controller: LambdaController = () => Promise.resolve({ ok: true, authToken })
            const wrapped = Fixtures.wrapWithDefaults(controller)

            // when
            const response = await wrapped({})

            // then
            expect(response).toEqual({
                statusCode: 200,
                headers: {
                    "Set-Cookie": "auth_token=" + authToken,
                    "Access-Control-Allow-Origin": process.env.ORIGIN!!,
                    "Access-Control-Allow-Credentials": "true"
                }
            })
        })
    })
})
