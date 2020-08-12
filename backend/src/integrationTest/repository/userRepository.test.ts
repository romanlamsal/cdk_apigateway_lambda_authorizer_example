import { DynamoDB } from "aws-sdk"
import { encrypt } from "../../impl/repository/kmsRepository"
import { checkCredentials } from "../../impl/service/loginService"
import { credentialsAreValid } from "../../impl/repository/userRepository"

beforeAll(async (done) => {
    await new DynamoDB().createTable({
        TableName: process.env.USERS_TABLE_NAME!!,
        BillingMode: "PAY_PER_REQUEST",
        AttributeDefinitions: [
            {
                AttributeName: "username",
                AttributeType: "S"
            }
        ],
        KeySchema: [
            {
                KeyType: "HASH",
                AttributeName: "username"
            }
        ]
    }).promise()
    done()
})
describe("checkCredentials", () => {
    const dynamoDb = new DynamoDB()
    let username: string
    let password: string
    beforeEach(async (done) => {
        username = "foobar"
        password = "foo&bar%baz123/==foobarbaz"
        await dynamoDb.putItem({
            TableName: process.env.USERS_TABLE_NAME!!,
            Item: {
                username: {
                    S: username
                },
                password: {
                    S: await encrypt(password)
                },
            }
        }).promise()
        done()
    })
    afterEach(async (done) => {
        await dynamoDb.deleteItem({
            TableName: process.env.USERS_TABLE_NAME!!,
            Key: { username: { S: username } }
        }).promise()
        done()
    })

    it("should return true when username and password are correct, although password is stored encrypted", async () => {
        // given
        // beforeEach

        // when
        const areValid = await credentialsAreValid(username, password)

        // then
        expect(areValid).toBeTruthy()
    })

    it("should return false when password and stored, encrypted password do not match", async () => {
        // given
        const wrongPassword = "wrongPassword"

        // when
        const areValid = await credentialsAreValid(username, wrongPassword)

        // then
        expect(areValid).toBeFalsy()
    })

    it("should return false when user does not exist", async () => {
        // given
        const nonExistentUser = "ghost"

        // when
        const areValid = await credentialsAreValid(nonExistentUser, password)

        // then
        expect(areValid).toBeFalsy()
    })
})
afterAll(async (done) => {
    await new DynamoDB().deleteTable({ TableName: process.env.USERS_TABLE_NAME!! }).promise()
    done()
})
