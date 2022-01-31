import inquirer from 'inquirer'
import { getKeyFromSecret } from './encrypt'

export const promptSecret = async(message: string) => {
    const { secret } = await inquirer.prompt([
        {
            type: 'password',
            name: 'secret',
            message,
        },
    ])
    return secret
}

export const loadSecretFromEnv = () => {
    const secret = process.env.EV_SECRET
    if (!secret) return null
    
    const secretKey = getKeyFromSecret(Buffer.from(secret, 'utf8'))
    return secretKey
}