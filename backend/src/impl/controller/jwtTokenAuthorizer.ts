import { LambdaController, LambdaControllerArgs, LambdaHandlerComponents } from "../../types/LambdaHandler"

interface AuthorizerResponse {
    principalId: string,
    policyDocument: {
        Version: "2012-10-17",
        Statement: {
            Action: "execute-api:Invoke",
            Effect: "Allow" | "Deny",
            Resource: string
        }[]
    }
}

const validateJwtToken = async ({ user }: LambdaControllerArgs, components: LambdaHandlerComponents) => {
    return !!(user && await components.tokenService.validateToken(user.jwtToken, components.encryptionRepository.verify))
}

export const jwtTokenAuthorizer = (components: LambdaHandlerComponents) =>
    async function (args: LambdaControllerArgs, methodArn: string): Promise<AuthorizerResponse> {
        const allow = await validateJwtToken(args, components)
        const user = args.user ? args.user.username : "anonymous"
        return {
            "principalId": user,
            "policyDocument": {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Action": "execute-api:Invoke",
                        "Effect": allow ? "Allow" : "Deny",
                        "Resource": methodArn
                    }
                ]
            }
        }
    }
