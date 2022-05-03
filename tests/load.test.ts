import { describe, it, expect } from 'vitest'
import ev from '../src/load'

describe('ev package should', () => {
    it('load variables from test environment', async() => {
        const variables = await ev('test', 'test')
        expect(variables).to.have.property('MY_VAR', 'my-value')
    })
})