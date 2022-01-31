// @see https://stackoverflow.com/questions/6953286/how-to-encrypt-data-that-needs-to-be-decrypted-in-node-js

import crypto from 'crypto'
import { error } from './log'

const 
    AUTH_TAG_BYTE_LEN = 16,
    IV_BYTE_LEN = 12,
    KEY_BYTE_LEN = 32

const getIV = () => crypto.randomBytes(IV_BYTE_LEN)

export const getKeyFromSecret = (secret: Buffer) => crypto.scryptSync(
    secret, 
    'EV_SECRET_SALT', 
    KEY_BYTE_LEN
)

export const encrypt = (content: Buffer, secret: Buffer) => {
    const iv = getIV()
    const cipher = crypto.createCipheriv(
        'aes-256-gcm', secret, iv,
        { authTagLength: AUTH_TAG_BYTE_LEN }
    )
    let encryptedMessage = cipher.update(content)
    encryptedMessage = Buffer.concat([encryptedMessage, cipher.final()])
    return Buffer.concat([iv, encryptedMessage, cipher.getAuthTag()])
}

export const decrypt = (encryptedCipher: Buffer, secret: Buffer) => {
    const iv = encryptedCipher.slice(0, IV_BYTE_LEN)
    const encryptedContent = encryptedCipher.slice(IV_BYTE_LEN, -AUTH_TAG_BYTE_LEN)
    const authTag = encryptedCipher.slice(-AUTH_TAG_BYTE_LEN)
    const decipher = crypto.createDecipheriv(
        'aes-256-gcm', secret, iv,
        { authTagLength: AUTH_TAG_BYTE_LEN }
    )
    decipher.setAuthTag(authTag)
    try {
        let decryptedMessage = decipher.update(encryptedContent)
        decryptedMessage = Buffer.concat([decryptedMessage, decipher.final()])
        return decryptedMessage
    } catch (e) {
        error('Wrong secret, weird...')
        process.exit(0)
    }
}

