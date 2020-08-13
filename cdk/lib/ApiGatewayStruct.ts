import * as cdk from "@aws-cdk/core"
import * as apigateway from "@aws-cdk/aws-apigateway"
import * as lambda from "@aws-cdk/aws-lambda"
import * as iam from "@aws-cdk/aws-iam"
import { APP_NAME } from "../bin/cdk"
import { Duration } from "@aws-cdk/core"

export enum HTTP_METHOD {
    GET = "GET",
}

export interface ApiGatewayStructProps {
    authorizer?: lambda.Function
}

export class ApiGatewayStruct extends cdk.Construct {
    apiGateway: apigateway.RestApi
    authorizer: apigateway.RequestAuthorizer

    private readonly apiGatewayRole: iam.Role

    constructor(scope: cdk.Stack, id: string, props: ApiGatewayStructProps) {
        super(scope, id)

        this.apiGateway = this.setupApiGateway()
        this.apiGatewayRole = this.setupApiGatewayRole()

        if (props.authorizer)
            this.addAuthorizer(props.authorizer, scope)
    }

    private addAuthorizer(authorizerLambda: lambda.Function, stack: cdk.Stack) {
        this.authorizer = new apigateway.RequestAuthorizer(stack, APP_NAME + "_apiGateway_authorizer", {
            assumeRole: this.apiGatewayRole,
            authorizerName: APP_NAME + "_apiGateway_authorizer",
            handler: authorizerLambda,
            identitySources: [ apigateway.IdentitySource.queryString("apiKey") ],
            resultsCacheTtl: Duration.millis(0),
        })
    }

    private setupApiGatewayRole(): iam.Role {
        return new iam.Role(this, APP_NAME + "_apiGateway_role", {
            assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
            roleName: APP_NAME + "_apiGateway_role",
            inlinePolicies: {
                invokeLambdas: new iam.PolicyDocument({
                    statements: [
                        new iam.PolicyStatement({
                            actions: [ "lambda:InvokeFunction" ],
                            resources: ["*"]
                        })
                    ]
                })
            }
        })
    }

    private setupApiGateway(): apigateway.RestApi {
        return new apigateway.RestApi(this, APP_NAME + "_apiGateway", {
            restApiName: `${ APP_NAME }_restApi`
        })
    }
}
