import { fetchVariables } from "./variables"

let variables: Record<string, string> | null = null
let loadedEnvironment: string | undefined | null = null

const ev = async(environment: string | undefined = undefined, secret?: string) => {
    if (variables === null && (environment !== loadedEnvironment)) {
        variables = (await fetchVariables(environment, secret)).variables
        loadedEnvironment = environment || undefined
    }
    return variables
}

export default ev

