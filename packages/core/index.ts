#!/usr/bin/env node
import { cac } from 'cac'
import { version } from '../../package.json'
import { loadFromDotenv, loadSecretFromFile, loadVariablesFromFile, saveSecretToFile, saveVariablesToFile } from './file'
import { fetchVariables, listVariables, removeVariable, setVariable } from './variables'
import k from 'kleur'
import { promptSecret } from './secret'
import { error } from './log'
import { getKeyFromSecret } from './encrypt'

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
                .reduce((acc: any, variableToRemove: string) => removeVariable(variableToRemove, acc), variables)
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
                    .reduce((acc: any, variableToAdd: string) => {
                        const [key, ...value] = variableToAdd.split('=')
                        return setVariable(key, value.join('='), acc)
                    }, variables)
                console.log(
                    `Added ${k.green().bold(variablesToAdd.length)} variables.`
                )
                saveVariablesToFile(newVariables, secret, env)
            }
        })
    
    cli
        .command('change-secret', 'Creates a new secret key')
        .option('--env, -e <env>', 'Sets the environment for which to change the secret')
        .action(async({ env }) => {
            const secret = await loadSecretFromFile(env)
            const oldSecret = await promptSecret('Enter your old secret')
            const oldSecretKey = getKeyFromSecret(Buffer.from(oldSecret, 'utf8'))
            if (secret.compare(oldSecretKey) !== 0) {
                error('Wrong secret, try again.')
                return
            }
            const newSecret = await promptSecret('Enter a new secret')
            const newSecretKey = saveSecretToFile(newSecret, env)
            const variables = loadVariablesFromFile(secret, env)
            saveVariablesToFile(variables, newSecretKey, env)
        })
    
    cli
        .command('set-secret', 'Sets the secret key')
        .option('--env, -e <env>', 'Sets the environment for which to change the secret')
        .action(async({ env }) => {
            const newSecret = await promptSecret('Enter a new secret')
            saveSecretToFile(newSecret, env)
        })

    cli
        .command('load <path>', 'Loads variables from a .env file')
        .option('--env, -e <env>', 'Sets the environment for which to add the variables')
        .action(async(path, { env }) => {
            const { secret, variables } = await fetchVariables(env)
            const dotenvVariables = loadFromDotenv(path)
            saveVariablesToFile({ ...variables, ...dotenvVariables }, secret, env)
            console.log(`Added ${k.green().bold(Object.keys(dotenvVariables).length)} variables.`)
        })

    cli.help()
    cli.parse()
    cli.version(version)
})()