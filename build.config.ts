import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
    declaration: true,
    entries: [
        'packages/core/index',
        'packages/core/load',
    ],
    rollup: {
        emitCJS: true,
    }
})