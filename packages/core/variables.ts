import { error } from "./log"
import k from 'kleur'
import { loadSecretFromEnv } from "./secret"
import { loadSecretFromFile, loadSecretFromFileSync, loadVariablesFromFile } from "./file"
import { getKeyFromSecret } from './encrypt'

export const setVariable = (key: string, value: string, variables: any) => {
    return { ...variables, [key]: value }
}

export const removeVariable = (key: string, variables: any) => {
    const newVariables = { ...variables }
    if (!(key in variables)) error(`Variable ${key} does not exist`)
    delete newVariables[key]
    return newVariables
}

export const listVariables = (allowlist: string[], variables: any) => {
    const variablesToList = allowlist.length > 0 ? allowlist : Object.keys(variables)
    if (variablesToList.length === 0) error('No variables to list')
    for (const key of variablesToList) {
        console.log(`${k.bold().green(key)}=${k.bold().blue(variables[key])}`)
    }
    return variables
}

export const fetchVariables = async(environment?: string, secret?: string, skipPrompt?: boolean) => {
    const secretBuffer = secret 
        ? getKeyFromSecret(Buffer.from(secret, 'utf8')) 
        : loadSecretFromEnv() || await loadSecretFromFile(environment, skipPrompt)
    const variables = loadVariablesFromFile(secretBuffer, environment)
    return { secret: secretBuffer, variables }
}

export const fetchVariablesSync = (environment?: string, secret?: string) => {
    const secretBuffer = secret 
        ? getKeyFromSecret(Buffer.from(secret, 'utf8')) 
        : loadSecretFromEnv() || loadSecretFromFileSync(environment)
    const variables = loadVariablesFromFile(secretBuffer, environment)
    return { secret: secretBuffer, variables }
}

