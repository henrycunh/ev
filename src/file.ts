import fs from 'fs'
import path from 'path'
import fse from 'fs-extra'
import { promptSecret } from './secret'
import { decrypt, encrypt, getKeyFromSecret } from './encrypt'
import { slugify } from './utils'
import { error } from './log'

const DEFAULT_DIRECTORY = '.ev'
const getFilePath = (name: string, environment?: string) => 
    path.join(DEFAULT_DIRECTORY, (environment ? `${slugify(environment)}.` : '') + name)

export const loadVariablesFromFile = (secret: Buffer, environment?: string) => {
    fse.ensureDirSync(DEFAULT_DIRECTORY)
    
    const filePath = getFilePath('variables', environment)
    fse.ensureFileSync(filePath)

    const encryptedContent = fs.readFileSync(filePath)
    // if buffer is empty, return empty object
    if (encryptedContent.length === 0) {
        return {}
    }

    const content = decrypt(encryptedContent, secret)

    return content
        .toString('utf8')
        .split('\n')
        .map(line => {
            const tokens = line.split('=')
            return tokens[0] === '' ? 
                null : 
                { 
                    key: tokens[0], 
                    value: tokens.slice(1).join('=') 
                }
        })
        .filter(variable => variable !== null)
        .reduce((variables, { key, value }) => {
            return { ...variables, [key]: value }
        }, {})
}

export const saveVariablesToFile = (variables: any, secret: Buffer, environment?: string) => {
    const filePath = getFilePath('variables', environment)
    fse.ensureFileSync(filePath)
    
    const content = Object.keys(variables)
        .map(key => `${key}=${variables[key]}`)
        .join('\n')
    const encryptedContent = encrypt(Buffer.from(content, 'utf8'), secret)
    
    fs.writeFileSync(filePath, encryptedContent)
}

export const loadSecretFromFile = async() => {
    const filePath = getFilePath('secret')
    fse.ensureFileSync(filePath)

    const secret = fs.readFileSync(filePath)
    
    if (secret.length === 0) {
        const newSecret = await promptSecret('Enter a new secret')
        return saveSecretToFile(newSecret)
    }
    
    return secret
}

export const saveSecretToFile = (secret: string) => {
    const filePath = getFilePath('secret')
    fse.ensureFileSync(filePath)
    
    const secretKey = getKeyFromSecret(Buffer.from(secret, 'utf8'))
    fs.writeFileSync(filePath, secretKey)

    const gitIgnoreFilePath = getFilePath('.gitignore')
    fs.writeFileSync(gitIgnoreFilePath, 'secret')

    return secretKey
}

export const listEnvironments = () => {
    const environments = fs.readdirSync(DEFAULT_DIRECTORY)
    return environments
        .filter(environment => environment.endsWith('.variables'))
        .map(environment => environment.replace('.variables', ''))
}

export const loadFromDotenv = (path: string) => {
    if (!fs.existsSync(path)) {
        error(`File ${path} does not exist`)
        return {}
    }
    const variables = fs.readFileSync(path, 'utf8')
        .split('\n')
        .filter(line => !(/^$|^#/.test(line)))
        .map(line => {
            const tokens = line.split('=')
            return tokens[0] === '' ? 
                null : 
                { 
                    key: tokens[0], 
                    value: tokens.slice(1).join('=') 
                }
        })
        .filter(variable => variable !== null)
        .reduce((variables, { key, value }) => {
            return { ...variables, [key]: value }
        }, {})
    return variables
}