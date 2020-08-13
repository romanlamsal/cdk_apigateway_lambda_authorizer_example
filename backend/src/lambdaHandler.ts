export const helloWorldHandler = () => Promise.resolve({
    statusCode: 200,
})

export const authorizerHandler = (event: any) => {
    const allow = event.queryStringParameters.apiKey === "allow"
    return Promise.resolve({
        principalId: "someone",
        policyDocument: {
            Version: "2012-10-17",
            Statement: [ {
                Action: "execute-api:Invoke",
                Effect: allow ? "Allow" : "Deny",
                Resource: [ "*" ]
            } ]
        }
    })
}
