import * as vscode from 'vscode'
import type { UriTab } from '../utils/tabUtils'
import BaseItem, { Context } from './baseItem'

export default class FileItem extends BaseItem {
  constructor(
    resourceUri: vscode.Uri,
    label: string,
    public readonly tab: UriTab,
  ) {
    super(resourceUri, label, vscode.TreeItemCollapsibleState.None)

    this.contextValue = this.tab.isPinned ? Context.PinnedFile : Context.File

    this.command = {
      command: 'vscode.open',
      title: 'Open File',
      arguments: [this.originalResourceUri],
    }

    this.setDescription()
  }

  private setDescription(): void {
    this.description = ''
    if (this.tab.isDirty) {
      this.description += '●'
    }
    if (this.tab.isPinned) {
      this.description += '†'
    }
    const tabGroupIndex = this.tab.group
      ? vscode.window.tabGroups.all.indexOf(this.tab.group) + 1
      : 0
    if (vscode.window.tabGroups.all.length > 1 && tabGroupIndex > 0) {
      this.description += vscode.l10n.t('openFilesExplorer.group.label', {
        0: tabGroupIndex,
      })
    }
  }
}
