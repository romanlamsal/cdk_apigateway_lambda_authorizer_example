import { decrypt, encrypt } from "../impl/repository/kmsRepository"
import KMS from "aws-sdk/clients/kms"

describe("Encrypt/Decrypt", () => {
    beforeAll(async (done) => {
        const kms = new KMS()
        try {
            const key = await kms.createKey({
                KeyUsage: "ENCRYPT_DECRYPT"
            }).promise()
            await kms.createAlias({
                AliasName: process.env.KMS_KEY_ALIAS!!,
                TargetKeyId: key.KeyMetadata!!.KeyId!!
            }).promise()
        } catch (e) {
            console.log("ERR", e)
        } finally {
            done()
        }
    })
    it("should encrypt and decrypt again", async () => {
        // given
        const message = "foobar:tothebaz"

        // when
        const encrypted = await encrypt(message)
        const decrypted = await decrypt(encrypted)

        // then
        expect(decrypted).toEqual(message)
    })
})
