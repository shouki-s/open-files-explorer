import * as vscode from 'vscode'
import {
  closeFile,
  closeFolder,
  collapseAll,
  unpinEditor,
} from './commands/editorCommands'
import type BaseItem from './items/baseItem'
import { OpenFilesTreeProvider } from './providers/openFilesTreeProvider'
import { isUriTab } from './utils/tabUtils'

export function activate(context: vscode.ExtensionContext): void {
  const treeDataProvider = new OpenFilesTreeProvider()
  const treeView = vscode.window.createTreeView('openFilesExplorer', {
    treeDataProvider,
  })
  registerEventHandlers(treeDataProvider, treeView)
  registerCommands(context)
  context.subscriptions.push(treeView)
}

function registerEventHandlers(
  treeDataProvider: OpenFilesTreeProvider,
  treeView: vscode.TreeView<BaseItem>,
): void {
  vscode.window.tabGroups.onDidChangeTabs(() => {
    treeDataProvider.refresh()
  })
  vscode.window.tabGroups.onDidChangeTabGroups(() => {
    treeDataProvider.refresh()
  })
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    const activeTab = vscode.window.tabGroups.activeTabGroup.activeTab
    if (!editor || !treeView.visible || !activeTab || !isUriTab(activeTab)) {
      return
    }
    const fileItem = treeDataProvider.findFileItem(activeTab.input.uri)
    if (fileItem) {
      treeView.reveal(fileItem, { select: true, focus: false })
    }
  })
}

function registerCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('openFilesExplorer.closeFile', closeFile),
    vscode.commands.registerCommand(
      'openFilesExplorer.unpinEditor',
      unpinEditor,
    ),
    vscode.commands.registerCommand(
      'openFilesExplorer.closeFolder',
      closeFolder,
    ),
    vscode.commands.registerCommand(
      'openFilesExplorer.collapseAll',
      collapseAll,
    ),
  )
}

export function deactivate(): void {}
