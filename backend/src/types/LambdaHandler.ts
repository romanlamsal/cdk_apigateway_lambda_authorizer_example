import { LoginService } from "../impl/service/loginService"
import { UserRepository } from "../impl/repository/userRepository"
import { Handler as LambdaHandler } from "aws-lambda"
import { JwtTokenService } from "../impl/service/jwtTokenService"
import { EncryptionRepository } from "../impl/repository/kmsRepository"

export interface LambdaHandlerComponents {
    loginService: typeof LoginService
    authRepository: typeof UserRepository
    encryptionRepository: typeof EncryptionRepository
    tokenService: typeof JwtTokenService // TODO: create basic interface
}

export type Headers = { [key: string]: string }

export type Body = { [key: string]: any } | undefined

export interface LambdaControllerArgs {
    user?: {
        jwtToken: string,
        username: string,
    }
    body?: Body
}

export interface LambdaControllerReturn {
    ok: boolean
    authToken?: string
    body?: Body
}

export interface CorsResponseHeaders extends Headers {
    "Access-Control-Allow-Origin": string,
    "Access-Control-Allow-Credentials": "true"
}

export interface CorsResponse {
    statusCode: number
    headers: CorsResponseHeaders
    body: Body
}

export type LambdaController = (args: LambdaControllerArgs, components: LambdaHandlerComponents) => Promise<LambdaControllerReturn>

export type HandlerWrapper = <T>(lambdaController: LambdaController, components: LambdaHandlerComponents) => LambdaHandler<any, CorsResponse>
