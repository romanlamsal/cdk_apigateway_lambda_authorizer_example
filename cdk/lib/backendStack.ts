import * as cdk from '@aws-cdk/core'
import * as lambda from "@aws-cdk/aws-lambda"
import { APP_NAME, RESOURCES } from "../bin/cdk"
import { ApiGatewayStruct, HTTP_METHOD } from "./ApiGatewayStruct"
import { LambdaApiEndpoint } from "./LambdaApiEndpoint"

export class BackendStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        const authorizerLambda = this.setupAuthorizerLambda()
        const { apiGateway, authorizer } = new ApiGatewayStruct(this, "BackendApiGatewayStack", {
            authorizer: authorizerLambda,
        })

        const helloWorldLambda = this.setupSimpleLambda()

        new LambdaApiEndpoint(apiGateway, APP_NAME + "_hello_world", {
            apiGateway: apiGateway,
            handler: helloWorldLambda,
            path: "/hello/world",
            method: HTTP_METHOD.GET,
        })

        new LambdaApiEndpoint(apiGateway, APP_NAME + "_goodbye_universe", {
            apiGateway: apiGateway,
            handler: helloWorldLambda,
            path: "/goodbye/universe",
            method: HTTP_METHOD.GET,
            authorizer: authorizer
        })
    }

    setupAuthorizerLambda(): lambda.Function {
        return new lambda.Function(this, "authorizerHandler", {
            runtime: lambda.Runtime.NODEJS_12_X,
            code: lambda.Code.fromAsset(RESOURCES.backend),
            handler: "lambdaHandler.authorizerHandler",
            environment: {
                ORIGIN: APP_NAME
            }
        })
    }

    setupSimpleLambda(): lambda.Function {
        return new lambda.Function(this, "helloWorlauthorizerHandlerServiceRoledLambda", {
            runtime: lambda.Runtime.NODEJS_12_X,
            code: lambda.Code.fromAsset(RESOURCES.backend),
            handler: "lambdaHandler.helloWorldHandler",
            environment: {
                ORIGIN: APP_NAME
            },
        })
    }
}
