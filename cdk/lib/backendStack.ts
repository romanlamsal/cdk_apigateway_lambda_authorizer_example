import * as cdk from '@aws-cdk/core'
import * as lambda from "@aws-cdk/aws-lambda"
import { APP_NAME, RESOURCES } from "../bin/cdk"
import { AuthStruct } from "./authStruct"
import { ApiGatewayStruct, HTTP_METHOD } from "./apiGatewayStruct"

export class BackendStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        /*const { login, authorizer } = new AuthStruct(this, "BackendAuthorizerStack", {
            accountId: this.account
        })*/

        const validate = this.setupCheckTokenLambda()

        new ApiGatewayStruct(this, "BackendApiGatewayStack", {
            authorizer,
            restApiEndpoints: [
                {
                    handler: login,
                    path: "/login",
                    method: HTTP_METHOD.POST,
                    useAuthorizer: false
                },
                {
                    handler: validate,
                    path: "/login",
                    method: HTTP_METHOD.GET,
                    useAuthorizer: true
                }
            ]
        })
    }

    setupCheckTokenLambda(): lambda.Function {
        return new lambda.Function(this, "checkToken", {
            runtime: lambda.Runtime.NODEJS_12_X,
            code: lambda.Code.fromAsset(RESOURCES.backend),
            handler: "lambdaHandler.checkTokenHandler",
            environment: {
                ORIGIN: APP_NAME
            }
        })
    }
}
