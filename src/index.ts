#!/bin/env node
import { cac } from 'cac'
import { version } from '../package.json'
import { listEnvironments, loadSecretFromFile, loadVariablesFromFile, saveSecretToFile, saveVariablesToFile } from './file'
import { listVariables, removeVariable, setVariable } from './variables'
import k from 'kleur'
import { promptSecret } from './secret'
import { error } from './log'
import { getKeyFromSecret } from './encrypt'


async function fetchVariables(environment?: string) {
    const secret = await loadSecretFromFile()
    const variables = loadVariablesFromFile(secret, environment)
    return { secret, variables }
}

(async function setupCommands() {
    const cli = cac('ev')

    cli
        .command('ls [...variables]', 'Lists all variables or the ones specified')
        .option('--env, -e <env>', 'Sets the environment for which to list the variables')
        .action(async(variablesToList, { env }) => {
            const { variables } = await fetchVariables(env)
            listVariables(variablesToList, variables)
        })
    
    cli
        .command('rm <...variables>', 'Remove the variables specified')
        .option('--env, -e <env>', 'Sets the environment for which to remove the variables')
        .action(async(variablesToRemove, { env }) => {
            const { variables, secret } = await fetchVariables(env)
            const newVariables = variablesToRemove
                .reduce((_: any, variableToRemove: string) => removeVariable(variableToRemove, variables), variables)
            saveVariablesToFile(newVariables, secret, env)
        })
    
    cli
        .command('[...variables]', 'Export variables or add new ones')
        .option('--env, -e <env>', 'Sets the environment for which to add the variables')
        .example('  $ ev\n  Exports every environment variable')
        .example('  $ ev MY_KEY=123\n  Sets the variable MY_KEY to the value 123')
        .action(async(args, { env }) => {
            const { variables, secret } = await fetchVariables(env)
            const variablesToAdd = args.filter((argument: string) => argument.includes('='))
            if (variablesToAdd.length === 0) {
                for (const key in variables) {
                    console.log(`export ${key}=${variables[key]}`)
                }
            } else {
                const newVariables = variablesToAdd
                    .reduce((_: any, variableToAdd: string) => {
                        const [key, ...value] = variableToAdd.split('=')
                        return setVariable(key, value.join('='), variables)
                    }, variables)
                console.log(
                    `Added ${k.green().bold(variablesToAdd.length)} variables.`
                )
                saveVariablesToFile(newVariables, secret, env)
            }
        })
    
    cli
        .command('change-secret', 'Creates a new secret key')
        .action(async() => {
            const secret = await loadSecretFromFile()
            const oldSecret = await promptSecret('Enter your old secret')
            const oldSecretKey = getKeyFromSecret(Buffer.from(oldSecret, 'utf8'))
            if (secret.compare(oldSecretKey) !== 0) {
                error('Wrong secret, try again.')
                return
            }
            const newSecret = await promptSecret('Enter a new secret')
            const newSecretKey = saveSecretToFile(newSecret)
            const variables = loadVariablesFromFile(secret)
            saveVariablesToFile(variables, newSecretKey)
            for (const env of listEnvironments()) {
                const envVariables = loadVariablesFromFile(secret, env)
                saveVariablesToFile(envVariables, newSecretKey, env)
            }
        })
    
    cli
        .command('set-secret', 'Sets the secret key')
        .action(async() => {
            const newSecret = await promptSecret('Enter a new secret')
            saveSecretToFile(newSecret)
        })

    cli.help()
    cli.parse()
    cli.version(version)
})()