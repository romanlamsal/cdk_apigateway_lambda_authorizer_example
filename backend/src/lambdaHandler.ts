import { LoginService } from "./impl/service/loginService"
import { parseCookieString } from "./impl/service/cookieService"
import { UserRepository } from "./impl/repository/userRepository"
import {
    CorsResponseHeaders,
    HandlerWrapper,
    LambdaControllerArgs,
    LambdaHandlerComponents,
} from "./types/LambdaHandler"
import { authenticate } from "./impl/controller/lambdaController"
import { JwtTokenService } from "./impl/service/jwtTokenService"
import { EncryptionRepository } from "./impl/repository/kmsRepository"
import { parseJwtToken } from "./impl/util/jwtTokenUtil"
import { jwtTokenAuthorizer } from "./impl/controller/jwtTokenAuthorizer"
import { Handler } from "aws-lambda"

const ProductionHandlerComponents: LambdaHandlerComponents = {
    loginService: LoginService,
    authRepository: UserRepository,
    encryptionRepository: EncryptionRepository,
    tokenService: JwtTokenService,
}

const getArgsFromRequest = (event: any) => {
    const args: LambdaControllerArgs = {}
    if (event.headers) {
        const cookieString = event.headers.Cookie || event.headers.cookie
        if (cookieString !== undefined) {
            const jwtToken = parseCookieString(cookieString).auth_token
            if (jwtToken)
                args.user = {
                    username: parseJwtToken(jwtToken).payload.sub,
                    jwtToken
                }
        }
    }
    if (event.body) {
        args.body = typeof event.body === "string" ? JSON.parse(event.body) : event.body
    }
    return args
}

export const wrapController: HandlerWrapper = (lambdaController, components) => (event) => {
    const args = getArgsFromRequest(event)

    return new Promise(async (resolve) => {
        const controllerReturn = await lambdaController(args, components)

        const headers: CorsResponseHeaders = {
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Origin": process.env.ORIGIN!!,
        }
        if (controllerReturn.authToken)
            headers["Set-Cookie"] = "auth_token=" + controllerReturn.authToken
        resolve({
            statusCode: controllerReturn.ok ? 200 : 400,
            body: controllerReturn.body,
            headers
        })
    })
}

export const loginHandler = wrapController(authenticate, ProductionHandlerComponents)
export const generateReportHandler = wrapController(() => Promise.resolve({ ok: true }), ProductionHandlerComponents)
export const authorizeHandler: Handler = async (event) =>
    await jwtTokenAuthorizer(ProductionHandlerComponents)(getArgsFromRequest(event), "*")
