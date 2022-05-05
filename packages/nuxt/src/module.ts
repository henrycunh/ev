import { defineNuxtModule } from '@nuxt/kit'
import ev from '../../core/load'

export interface ModuleOptions {
  environment?: string
  secret?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'ev',
    configKey: 'ev'
  },
  async setup (options, nuxt) {
    try {
      console.log('(nuxt-ev) Initializing variables...')
      const variables = await ev(options.environment, options.secret)
      for (const key in variables) {
        process.env[key] = variables[key]
      }
    } catch (e) {
      console.error(`(nuxt-ev) ${e.message}`)
    }
  }
})
