import inquirer from 'inquirer'

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
