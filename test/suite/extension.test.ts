import * as assert from 'node:assert'
import * as vscode from 'vscode'
import { OpenFilesTreeProvider } from '../../src/providers/openFilesTreeProvider'
// import * as myExtension from '../../extension';

suite('Extension Test Suite', function () {
  // Set test timeout
  this.timeout(30000)

  vscode.window.showInformationMessage('Start all tests.')

  setup(async () => {
    // Wait for extension activation
    const extension = vscode.extensions.getExtension(
      'shouki-s.open-files-explorer',
    )
    if (!extension) {
      throw new Error('Extension not found')
    }
    await extension.activate()
    await new Promise((resolve) => setTimeout(resolve, 1000))
  })

  teardown(async () => {})

  test('Tree View is registered', async () => {
    // Verify extension exists
    const extension = vscode.extensions.getExtension(
      'shouki-s.open-files-explorer',
    )
    assert.ok(extension, 'Extension should be registered')
    assert.ok(extension.isActive, 'Extension should be active')

    // Verify tree view exists
    const treeView = vscode.window.createTreeView('openFilesExplorer', {
      treeDataProvider: new OpenFilesTreeProvider(),
    })
    assert.ok(treeView, 'Tree view should be created')
  })
})
