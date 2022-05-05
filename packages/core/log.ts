import k from 'kleur'

export const error = (message: string) => console.log(
    `${k.red('[ERROR]')} ${k.bold(message)}`
)
