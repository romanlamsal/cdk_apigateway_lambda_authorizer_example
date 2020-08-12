import { LambdaController } from "../../types/LambdaHandler"

export const authenticate: LambdaController = async ({ body }, {
    loginService,
    tokenService,
    encryptionRepository,
    authRepository
}) => {
    if (body && body.username && body.password) {
        const credentialsAreValid = await loginService.checkCredentials(body.username, body.password, authRepository)
        if (credentialsAreValid)
            return { ok: true, authToken: await tokenService.createToken({ username: body.username }, encryptionRepository.sign) }
    }
    return { ok: false }
}
