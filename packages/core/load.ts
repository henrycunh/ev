import { isInitialized } from "./file"
import { fetchVariablesSync } from "./variables"

let variables: Record<string, string> | null = null
let loadedEnvironment: string | undefined | null = null

const ev = (environment: string | undefined = undefined, secret?: string) => {
    if (isInitialized(environment)) {
        if (variables === null && (environment !== loadedEnvironment)) {
            variables = fetchVariablesSync(environment, secret).variables
            loadedEnvironment = environment || undefined
        }
        return variables
    } else {
        throw new Error(`${environment ? `Environment ${environment}` : `Default environment`} is not initialized`)
    }
}

export default ev

