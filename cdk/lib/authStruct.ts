import * as cdk from "@aws-cdk/core"
import * as lambda from "@aws-cdk/aws-lambda"
import * as dynamodb from "@aws-cdk/aws-dynamodb"
import { APP_NAME, RESOURCES } from "../bin/cdk"
import * as kms from "@aws-cdk/aws-kms"
import * as iam from "@aws-cdk/aws-iam"

export interface AuthStructProps {
    accountId: string
}

export class AuthStruct extends cdk.Construct {
    authorizer: lambda.Function
    login: lambda.Function

    private props: AuthStructProps

    constructor(scope: cdk.Construct, id: string, props: AuthStructProps) {
        super(scope, id)
        this.props = props

        const usersTable = this.setupUsersTable()

        this.authorizer = this.setupAuthorizerLambda()
        this.login = this.setupLoginLambda(usersTable)

        this.setupJwtKey(this.authorizer, this.login)
        this.setupPasswordKey(this.login)
    }

    private setupUsersTable(): dynamodb.Table {
        return new dynamodb.Table(this, "usersTable", {
            tableName: `${ APP_NAME }_users`,
            partitionKey: {
                type: dynamodb.AttributeType.STRING,
                name: "username"
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        })
    }

    private setupAuthorizerLambda(): lambda.Function {
        return new lambda.Function(this, "authorizer", {
            functionName: `${ APP_NAME }_authorizer`,
            runtime: lambda.Runtime.NODEJS_12_X,
            code: lambda.Code.fromAsset(RESOURCES.backend),
            handler: "lambdaHandler.authorizeHandler",
            environment: {
                ORIGIN: APP_NAME,
            }
        })
    }

    private setupLoginLambda(usersTable: dynamodb.Table): lambda.Function {
        const handler = new lambda.Function(this, "login", {
            functionName: `${ APP_NAME }_login`,
            runtime: lambda.Runtime.NODEJS_12_X,
            code: lambda.Code.fromAsset(RESOURCES.backend),
            handler: "lambdaHandler.loginHandler",
            environment: {
                ORIGIN: APP_NAME,
                USERS_TABLE_NAME: usersTable.tableName,
            }
        })

        usersTable.grantReadData(handler)

        return handler
    }

    private setupJwtKey(authorizer: lambda.Function, login: lambda.Function): kms.CfnAlias {
        const kmsKey = new kms.CfnKey(this, "jwtKey", {
            keyUsage: "SIGN_VERIFY",
            keyPolicy: new iam.PolicyDocument({
                statements: [
                    new iam.PolicyStatement({
                        principals: [ new iam.AccountPrincipal(this.props.accountId) ],
                        actions: [ "*" ],
                        resources: [ "*" ]
                    }),
                    new iam.PolicyStatement({
                        principals: [ new iam.ArnPrincipal(authorizer.functionArn) ],
                        resources: [ "*" ],
                        actions: [ "kms:Verify" ]
                    }),
                    new iam.PolicyStatement({
                        principals: [ new iam.ArnPrincipal(login.functionArn) ],
                        resources: [ "*" ],
                        actions: [ "kms:Sign" ]
                    })
                ]
            })
        })
        const cfnAlias = new kms.CfnAlias(this, "jwtKeyAlias", {
            aliasName: `${ APP_NAME }_jwtKey`,
            targetKeyId: kmsKey.attrArn,
        })

        authorizer.addEnvironment("JWT_KEY_ALIAS", cfnAlias.aliasName)
        login.addEnvironment("JWT_KEY_ALIAS", cfnAlias.aliasName)

        return cfnAlias
    }

    private setupPasswordKey(login: lambda.Function): kms.CfnAlias {
        const kmsKey = new kms.CfnKey(this, "passwordKey", {
            keyUsage: "ENCRYPT_DECRYPT",
            keyPolicy: new iam.PolicyDocument({
                statements: [
                    new iam.PolicyStatement({
                        principals: [ new iam.AccountPrincipal(this.props.accountId) ],
                        actions: [ "*" ],
                        resources: [ "*" ]
                    }),
                    new iam.PolicyStatement({
                        principals: [ new iam.ArnPrincipal(login.functionArn) ],
                        resources: [ "*" ],
                        actions: [ "kms:Decrypt" ]
                    })
                ]
            })
        })

        const cfnAlias = new kms.CfnAlias(this, "passwordKeyAlias", {
            aliasName: `${ APP_NAME }_passwordKey`,
            targetKeyId: kmsKey.attrArn,
        })

        login.addEnvironment("KMS_KEY_ALIAS", cfnAlias.aliasName)

        return cfnAlias
    }
}
