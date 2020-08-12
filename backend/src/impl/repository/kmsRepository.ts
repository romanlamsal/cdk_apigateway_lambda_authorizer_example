import { KMS } from "aws-sdk"

// encrypt string to binary, return as base64
export const encrypt = (text: string, kms = new KMS()) => new Promise<string>((resolve, reject) => {
    kms.encrypt({
        KeyId: process.env.KMS_KEY_ALIAS!!,
        Plaintext: text
    }, (err, encrypted) => {
        if (err) {
            reject(err + ": " + err.stack)
        } else {
            resolve(encrypted.CiphertextBlob!!.toString("base64"))
        }
    })
})

// decrypt base64 encoded binary-string back to string
export const decrypt = (base64String: string, kms = new KMS()) => new Promise<string>((resolve, reject) => {
    kms.decrypt({
        CiphertextBlob: Buffer.from(base64String, "base64"),
        KeyId: process.env.KMS_KEY_ALIAS!!,
    }, (err, decrypted) => {
        if (err) {
            reject(err + ": " + err.stack)
        } else {
            resolve(decrypted.Plaintext!!.toString("utf-8"))
        }
    })
})

const signingAlgorithm = "RSASSA_PKCS1_V1_5_SHA_256"
export const sign = (message: string, kms = new KMS()) => new Promise<string>((resolve, reject) => {
    kms.sign({
        KeyId: process.env.JWT_KEY_ALIAS!!,
        SigningAlgorithm: signingAlgorithm,
        Message: Buffer.from(message)
    }, (err, signed) => {
        if (err) {
            reject(err + ": " + err.stack)
        } else {
            resolve(signed.Signature!!.toString("base64"))
        }
    })
})

export const verify = (message: string, signature: string, kms = new KMS()) => new Promise<boolean>((resolve, reject) => {
    kms.verify({
        KeyId: process.env.JWT_KEY_ALIAS!!,
        SigningAlgorithm: signingAlgorithm,
        Message: message,
        Signature: Buffer.from(signature, "base64")
    }, (err, signed) => {
        if (err) {
            if (err.code !== "KMSInvalidSignatureException") {
                reject(err + ": " + err.stack)
            } else {
                resolve(false)
            }
        } else {
            resolve(signed.SignatureValid === true)
        }
    })
})

export const EncryptionRepository = {
    sign, verify, encrypt, decrypt
}
