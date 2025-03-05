import * as assert from 'node:assert'
import * as vscode from 'vscode'
import FileItem from '../../../src/items/fileItem'
import type { UriTab } from '../../../src/utils/tabUtils'

suite('FileItem Test Suite', () => {
  test('FileItem is correctly initialized', () => {
    const uri = vscode.Uri.file('/test/file.ts')
    const label = 'file.ts'
    const tab = {
      input: {
        uri,
      },
    } as UriTab

    const fileItem = new FileItem(uri, label, tab)

    assert.strictEqual(fileItem.label, label)
    assert.deepStrictEqual(fileItem.resourceUri, uri)
    assert.strictEqual(
      fileItem.collapsibleState,
      vscode.TreeItemCollapsibleState.None,
    )
    assert.strictEqual(fileItem.contextValue, 'file')
  })

  test('Command is correctly set', () => {
    const uri = vscode.Uri.file('/test/file.ts')
    const label = 'file.ts'
    const tab = {
      input: {
        uri,
      },
    } as UriTab

    const fileItem = new FileItem(uri, label, tab)

    assert.ok(fileItem.command)
    assert.strictEqual(fileItem.command.command, 'vscode.open')
    assert.deepStrictEqual(fileItem.command.arguments, [uri])
  })
})
