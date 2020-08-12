import { authenticate } from "../../impl/controller/lambdaController"
import { Fixtures } from "../Fixtures"
import { Body, LambdaControllerReturn } from "../../types/LambdaHandler"

describe("authenticate", () => {
    const SIGNATURE = "siggi signature"
    const authenticateTest = async (
        desc: string,
        body: Body,
        credentialsAreValid: boolean = true,
        response: LambdaControllerReturn = { ok: false }
    ) => it(desc, async () => {
        // given
        const components = Fixtures.mockComponent()
        components.tokenService.createToken = async (_: any, sign: any) => body!!.username + "." + await sign(body!!.username)
        components.encryptionRepository.sign = async () => SIGNATURE
        components.loginService.checkCredentials = async () => credentialsAreValid

        // when
        const controllerReturn = await authenticate({ body }, components)

        // then
        expect(controllerReturn).toEqual(response)
    })

    authenticateTest("should return ok=false when args.body is undefined/empty", undefined)
    authenticateTest("should return ok=false when args.body.username is undefined/empty", { password: "bar" })
    authenticateTest("should return ok=false when args.body.password is undefined/empty", { username: "foo" })
    authenticateTest("should return ok=false when credentials in body are not valid", {
        username: "foo",
        password: "bar"
    }, false)
    authenticateTest("should return ok=true and authToken when credentials in body are valid", {
        username: "foo",
        password: "bar"
    }, true, { ok: true, authToken: "foo" + "." + SIGNATURE })
})
