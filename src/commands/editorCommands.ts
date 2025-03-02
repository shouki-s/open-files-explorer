import * as vscode from 'vscode'
import type FileItem from '../items/fileItem'
import type FolderItem from '../items/folderItem'
import { findTab } from '../utils/tabUtils'

export async function closeFile(item: FileItem): Promise<void> {
  const tab = findTab(item.originalResourceUri)
  if (tab) {
    await vscode.window.tabGroups.close(tab)
  }
}

export async function unpinEditor(item: FileItem): Promise<void> {
  const tab = findTab(item.originalResourceUri)
  if (tab?.input instanceof vscode.TabInputText) {
    await vscode.commands.executeCommand(
      'workbench.action.unpinEditor',
      tab.input.uri,
    )
  }
}

export async function closeFolder(item: FolderItem): Promise<void> {
  const tabsToClose = vscode.window.tabGroups.all
    .flatMap((group) => group.tabs)
    .filter(
      (tab) =>
        tab.input instanceof vscode.TabInputText &&
        tab.input.uri.fsPath.startsWith(item.originalResourceUri.fsPath) &&
        !tab.isPinned,
    )
  await vscode.window.tabGroups.close(tabsToClose)
}
