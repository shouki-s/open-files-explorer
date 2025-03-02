import * as assert from 'node:assert'
import * as vscode from 'vscode'
import { OpenFilesTreeProvider } from '../../../src/providers/openFilesTreeProvider'
import { createTestEditor } from '../../helpers/testUtils'

suite('OpenEditorsTreeProvider Test Suite', () => {
  let provider: OpenFilesTreeProvider

  setup(async function () {
    this.timeout(10000) // Set timeout to 10 seconds
    provider = new OpenFilesTreeProvider()
  })

  teardown(async function () {
    this.timeout(10000) // Set timeout to 10 seconds
  })

  test('Tree items are created when editor is opened', async () => {
    await createTestEditor('test content', 'typescript')
    provider.refresh() // Update tree
    const root = provider.getChildren()

    // Only test if workspace folder exists
    if (
      vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.length > 0
    ) {
      assert.strictEqual(root.length, 1)
      const folder = root[0]
      const children = provider.getChildren(folder)
      assert.strictEqual(children.length, 1) // One file
      assert.strictEqual(children[0].label, 'Untitled-1')
    }
  })

  test('TreeItem is correctly retrieved', async () => {
    await createTestEditor('test content', 'typescript')
    provider.refresh()
    const root = provider.getChildren()

    if (
      vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.length > 0
    ) {
      const folder = root[0]
      const treeItem = provider.getTreeItem(folder)
      assert.strictEqual(
        treeItem.collapsibleState,
        vscode.TreeItemCollapsibleState.Expanded,
      )
    }
  })

  test('Tree items are removed when editor is closed', async () => {
    await createTestEditor('test content')
    provider.refresh()
    let root = provider.getChildren()

    if (
      vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.length > 0
    ) {
      assert.strictEqual(provider.getChildren(root[0]).length, 1)
      await vscode.commands.executeCommand('workbench.action.closeActiveEditor')
      provider.refresh()
      root = provider.getChildren()
      assert.strictEqual(provider.getChildren(root[0]).length, 0)
    }
  })
})
