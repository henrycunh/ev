import { $, argv } from 'zx'
import k from 'kleur'
import { read } from 'fsxx'
$.verbose = false

try {
    await $`which nr`
} catch (e) {
    console.log(`the binary ${k.bold().red('nr')} isn't installed`)
    process.exit(0)
}

// Build the package
console.log(`building the package`)
await $`nr build`

// Change the package version
console.log(`changing the package version`)
const pkg = await read.json`package.json`

const { _: [type] } = argv

const newVersion = ({
    patch: () => {
        const [major, minor, patch] = pkg.version.split('.')
        return `${major}.${minor}.${+patch + 1}`
    },
    minor: () => {
        const [major, minor,] = pkg.version.split('.')
        return `${major}.${+minor + 1}.0`
    },
    major: () => {
        const [major,,] = pkg.version.split('.')
        return `${+major + 1}.0.0`
    },
    undefined: () => pkg.version,
})[type]()

pkg.version = newVersion
await $`echo ${JSON.stringify(pkg, null, 4)} > package.json`
console.log(`new version: ${k.bold().green(newVersion)}`)

// await save()

// Push the tagged release commit 

// Create the Github release
