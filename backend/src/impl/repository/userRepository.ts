import { DynamoDB } from "aws-sdk"
import { decrypt } from "./kmsRepository"

export function credentialsAreValid(username: string, password: string, dynamoDB = new DynamoDB()) {
    return new Promise<boolean>((resolve, reject) => {
        dynamoDB.getItem({
            ExpressionAttributeNames: {
                "#password": "password"
            },
            Key: {
                username: {
                    S: username
                }
            },
            ProjectionExpression: "#password",
            TableName: process.env.USERS_TABLE_NAME!!
        }, async (err, data) => {
            if (err) {
                reject(err + ": " + err.stack)
            } else {
                if (data.Item) {
                    const decryptedPassword = await decrypt(data.Item.password.S!!)
                    resolve(decryptedPassword === password)
                } else
                    resolve(false)
            }
        })
    })
}

export const UserRepository = {
    credentialsAreValid
}
