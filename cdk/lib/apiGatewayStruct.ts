import * as cdk from "@aws-cdk/core"
import { Duration } from "@aws-cdk/core"
import * as apigateway from "@aws-cdk/aws-apigateway"
import { AuthorizationType } from "@aws-cdk/aws-apigateway"
import * as lambda from "@aws-cdk/aws-lambda"
import * as iam from "@aws-cdk/aws-iam"
import { APP_NAME } from "../bin/cdk"

export enum HTTP_METHOD {
    GET = "GET",
    POST = "POST",
}

export interface ApiGatewayStructProps {
    restApiEndpoints: Array<{ handler: lambda.Function, path: string, method: HTTP_METHOD, useAuthorizer: boolean }>
    authorizer?: lambda.Function
}

export class ApiGatewayStruct extends cdk.Construct {
    private apiGateway: apigateway.RestApi
    private apiGatewayRole: iam.Role
    private authorizer: apigateway.RequestAuthorizer
    private props: ApiGatewayStructProps
    constructor(scope: cdk.Construct, id: string, props: ApiGatewayStructProps) {
        super(scope, id)
        this.props = props

        this.apiGateway = this.setupApiGateway()
        this.apiGatewayRole = this.setupApiGatewayRole()

        if (props.authorizer)
            this.addAuthorizer(props.authorizer)

        props.restApiEndpoints.forEach(args =>
            this.registerLambdaInApi(args.handler, args.path, args.method, args.useAuthorizer))
    }

    registerLambdaInApi(
        handler: lambda.Function,
        path: string,
        method: HTTP_METHOD,
        useAuthorizer: boolean,
    ) {
        let resource = this.apiGateway.root

        if (path !== "/") {
            for (const pathPart in path.split("/")) {
                if (resource.getResource(pathPart) === undefined) {
                    resource = resource.addResource(pathPart)
                } else {
                    resource = resource.getResource(pathPart)!
                }
            }
        }

        const handlerIntegration = new apigateway.AwsIntegration({
            service: "lambda",
            action: "lambda:InvokeFunction",
            integrationHttpMethod: method,
            options: {
                credentialsRole: this.apiGatewayRole,
                requestParameters: {
                    // "integration.request.header.Cookie": "method.request.header.Cookie"
                }
            }
        })

        let integrationProps: apigateway.MethodOptions = {}

        if (useAuthorizer) {
            integrationProps = Object.assign(integrationProps, {
                authorizationType: AuthorizationType.CUSTOM,
                authorizer: this.authorizer
            })
        }

        resource.addMethod(method, handlerIntegration, integrationProps)
    }

    addAuthorizer(authorizerLambda: lambda.Function) {
        this.authorizer = new apigateway.RequestAuthorizer(this.apiGateway, APP_NAME + "_apiGateway_authorizer", {
            authorizerName: APP_NAME + "_jwtTokenAuthorizer",
            handler: authorizerLambda,
            identitySources: [ apigateway.IdentitySource.header("Cookie") ],
            resultsCacheTtl: Duration.millis(0),
        })
    }

    private setupApiGatewayRole(): iam.Role {
        return new iam.Role(this, APP_NAME + "_apiGateway_role", {
            assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com")
        })
    }

    private setupApiGateway(): apigateway.RestApi {
        return new apigateway.RestApi(this, APP_NAME + "_apiGateway", {
            restApiName: `${ APP_NAME }_restApi`
        })
    }
}
