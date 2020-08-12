import { checkCredentials } from "../../impl/service/loginService"

describe("isAuthorized", () => {
    const authRepository = {
        credentialsAreValid: (username: string, password: string) =>
            Promise.resolve(username === "foo" && password === "barbaz")
    }
    it("should return true when authorized token is valid", async () => {
        // given
        const user = "foo"
        const correctPassword = "barbaz"

        // when
        const authorized = await checkCredentials(user, correctPassword, authRepository)

        // then
        expect(authorized).toBeTruthy()
    })
    it("should return false when authorized token is valid", async () => {
        // given
        const user = "foo"
        const incorrectPassword = ""

        // when
        const authorized = await checkCredentials(user, incorrectPassword, authRepository)

        // then
        expect(authorized).toBeFalsy()
    })
})
