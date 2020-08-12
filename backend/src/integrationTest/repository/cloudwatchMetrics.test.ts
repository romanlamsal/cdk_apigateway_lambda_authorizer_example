import { putUserAuthorization } from "../../impl/repository/cloudwatchMetrics"

describe("putUserAuthorization", () => {
    it("should not reject with success", async () => {
        // given
        const username = "foo"
        const sourceIp = "192.168.0.1"
        const resource = "/bar"
        const success = true

        // when
        const response = await putUserAuthorization(username, sourceIp, resource, success)

        // then
        expect(response).toEqual({})
    })
})
