import * as path from 'node:path'
import { runTests } from '@vscode/test-electron'

async function main() {
  try {
    // Path to the workspace where tests will be run
    const projectRoot = path.resolve(__dirname, '../')
    const extensionDevelopmentPath = projectRoot
    const extensionTestsPath = path.resolve(projectRoot, 'out/test/suite/index')
    const workspacePath = projectRoot

    console.log('Project root:', projectRoot)
    console.log('Extension development path:', extensionDevelopmentPath)
    console.log('Extension tests path:', extensionTestsPath)
    console.log('Workspace path:', workspacePath)

    // Run tests
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [
        workspacePath,
        '--disable-extensions',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-gl-drawing-for-tests',
        '--force-cpu-draw',
        '--user-data-dir=/tmp/vscode-test/user-data',
        '--force-device-scale-factor=1',
      ],
    })
  } catch (err) {
    console.error('Failed to run tests:', err)
    process.exit(1)
  }
}

main()
