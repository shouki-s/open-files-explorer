import * as vscode from 'vscode'

export enum Context {
  File = 'file',
  Folder = 'folder',
  PinnedFile = 'pinnedFile',
}

export default abstract class BaseItem extends vscode.TreeItem {
  constructor(
    public readonly resourceUri: vscode.Uri,
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly children: BaseItem[] = [],
  ) {
    super(resourceUri, collapsibleState)
    this.tooltip = label
  }
}
