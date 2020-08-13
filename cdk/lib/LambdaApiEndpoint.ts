import * as cdk from "@aws-cdk/core"
import * as lambda from "@aws-cdk/aws-lambda"
import * as apigateway from "@aws-cdk/aws-apigateway"
import { HTTP_METHOD } from "./ApiGatewayStruct"
import { RestApi } from "@aws-cdk/aws-apigateway"

export interface LambdaApiEndpointProps {
    apiGateway: apigateway.RestApi
    handler: lambda.Function,
    path: string,
    method: HTTP_METHOD,
    authorizer?: apigateway.Authorizer
}

export class LambdaApiEndpoint extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string, props: LambdaApiEndpointProps) {
        super(scope, id)

        const { apiGateway, handler, path, method, authorizer } = props

        const resource = LambdaApiEndpoint.createResourcesIfNecessary(path, apiGateway)

        const handlerIntegration = new apigateway.LambdaIntegration(handler)

        let integrationProps: apigateway.MethodOptions = {}

        if (authorizer) {
            const authorizerIntegrationProps: Pick<apigateway.MethodOptions, "authorizer" | "authorizationType"> = {
                authorizationType: apigateway.AuthorizationType.CUSTOM, authorizer
            }
            integrationProps = Object.assign(integrationProps, authorizerIntegrationProps)
        }

        resource.addMethod(method, handlerIntegration, integrationProps)
    }

    private static createResourcesIfNecessary(path: string, apiGateway: RestApi) {
        let resource = apiGateway.root
        if (path !== "/") {
            for (const pathPart of path.split("/").filter(pathPart => pathPart.length > 0)) {
                if (resource.getResource(pathPart) === undefined) {
                    resource = resource.addResource(pathPart)
                } else {
                    resource = resource.getResource(pathPart)!
                }
            }
        }
        return resource
    }
}
