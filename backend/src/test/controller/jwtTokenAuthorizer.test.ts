import { Fixtures } from "../Fixtures"
import { jwtTokenAuthorizer } from "../../impl/controller/jwtTokenAuthorizer"

describe("validateToken", () => {
    it("should return ok=false when args.user is undefined", async () => {
        // given
        const components = Fixtures.mockComponent()
        components.tokenService.validateToken = async () => true

        // when
        const controllerReturn = await jwtTokenAuthorizer(components)({ user: undefined }, "foo")

        // then
        expect(controllerReturn).toEqual({
            "principalId": "anonymous",
            "policyDocument": {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Action": "execute-api:Invoke",
                        "Effect": "Deny",
                        "Resource": "foo"
                    }
                ]
            }
        })
    })

    it("should return ok=false when user credentials are not valid", async () => {
        // given
        const username = "the_user"
        const components = Fixtures.mockComponent()
        components.tokenService.validateToken = async () => false

        // when
        const controllerReturn = await jwtTokenAuthorizer(components)({ user: { jwtToken: "foo.bar.baz", username } }, "bar")

        // then
        expect(controllerReturn).toEqual({
            "principalId": username,
            "policyDocument": {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Action": "execute-api:Invoke",
                        "Effect": "Deny",
                        "Resource": "bar"
                    }
                ]
            }
        })
    })

    it("should return ok=true when user credentials are valid", async () => {
        // given
        const username = "the_user"
        const components = Fixtures.mockComponent()
        components.tokenService.validateToken = async () => true

        // when
        const controllerReturn = await jwtTokenAuthorizer(components)({ user: { jwtToken: "foo.bar.baz", username } }, "baz")

        // then
        expect(controllerReturn).toEqual({
            "principalId": username,
            "policyDocument": {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Action": "execute-api:Invoke",
                        "Effect": "Allow",
                        "Resource": "baz"
                    }
                ]
            }
        })
    })
})
