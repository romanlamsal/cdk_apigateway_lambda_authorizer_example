import { LambdaController, LambdaHandlerComponents } from "../types/LambdaHandler"
import { wrapController } from "../lambdaHandler"
import { Context } from "aws-lambda"
import { Base64 } from "../impl/util/base64Util"
import { JwtTokenHeader } from "../impl/service/jwtTokenService"

function wrapWithDefaults(lambdaController: LambdaController, components: LambdaHandlerComponents = Fixtures.mockComponent()) {
    return (event: any) =>
        wrapController(lambdaController, components)(event, {} as Context, () => ({}))
}

export const Fixtures: any = {
    username: () => "foobar",
    password: () => "barbaz",
    header: () => ({ typ: "jwt" }),
    headerHash: (header: JwtTokenHeader = Fixtures.header()) => Base64.serialize(JSON.stringify(header)),
    payloadHash: (username: string = Fixtures.username()) =>
        Base64.serialize(JSON.stringify({ iss: "issu.er", exp: "9999-12-31", sub: username})),
    signature: () => Base64.serialize("iamsignature"),
    token: () => Fixtures.headerHash() + "." + Fixtures.payloadHash() + "." + Fixtures.signature(),
    mockComponent(partialComponent: Partial<LambdaHandlerComponents> = {}): LambdaHandlerComponents {
        return {
            loginService: {
                checkCredentials: jest.fn(() => Promise.reject("Not implemented"))
            },
            authRepository: {
                credentialsAreValid: jest.fn(() => Promise.reject("Not implemented"))
            },
            encryptionRepository: {
                sign: jest.fn(() => Promise.reject("Not implemented")),
                decrypt: jest.fn(() => Promise.reject("Not implemented")),
                encrypt: jest.fn(() => Promise.reject("Not implemented")),
                verify: jest.fn(() => Promise.reject("Not implemented")),
            },
            tokenService: {
                createToken: jest.fn(() => Promise.reject("Not implemented")),
                validateToken: jest.fn(() => Promise.reject("Not implemented")),
            },
            metrics: {
                putUserAuthorization: jest.fn(() => Promise.reject("Not implemented"))
            },
            ...partialComponent
        }
    },
    wrapWithDefaults
}
