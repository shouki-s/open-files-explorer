import * as assert from 'node:assert'
import * as vscode from 'vscode'
import FileItem from '../../../src/items/fileItem'
import FolderItem from '../../../src/items/folderItem'
import type { UriTab } from '../../../src/utils/tabUtils'
import { toOpenedFileUri } from '../../../src/utils/uriUtils'
suite('FolderItem Test Suite', () => {
  test('FolderItem is correctly initialized', () => {
    const uri = vscode.Uri.file('/test/folder')
    const label = 'folder'
    const children: FileItem[] = []

    const folderItem = new FolderItem(uri, label, children)

    assert.strictEqual(folderItem.label, label)
    assert.deepStrictEqual(folderItem.resourceUri, toOpenedFileUri(uri))
    assert.strictEqual(
      folderItem.collapsibleState,
      vscode.TreeItemCollapsibleState.Expanded,
    )
    assert.strictEqual(folderItem.contextValue, 'folder')
  })

  test('Child items are correctly set', () => {
    const uri = vscode.Uri.file('/test/folder')
    const label = 'folder'

    const fileUri = vscode.Uri.file('/test/folder/file.ts')
    const fileTab = {
      input: {
        uri: fileUri,
      },
    } as UriTab
    const fileItem = new FileItem(fileUri, 'file.ts', fileTab)

    const children = [fileItem]
    const folderItem = new FolderItem(uri, label, children)

    assert.strictEqual(folderItem.children.length, 1)
    assert.strictEqual(folderItem.children[0], fileItem)
  })

  test('Empty folders are initialized in expanded state', () => {
    const uri = vscode.Uri.file('/test/folder')
    const label = 'folder'
    const children: FileItem[] = []

    const folderItem = new FolderItem(uri, label, children)

    assert.strictEqual(
      folderItem.collapsibleState,
      vscode.TreeItemCollapsibleState.Expanded,
    )
  })
})
