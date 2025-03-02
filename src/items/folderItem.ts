import * as vscode from 'vscode'
import BaseItem, { Context } from './baseItem'

export default class FolderItem extends BaseItem {
  constructor(resourceUri: vscode.Uri, label: string, children: BaseItem[]) {
    super(
      resourceUri,
      label,
      vscode.TreeItemCollapsibleState.Expanded,
      children,
    )
    this.contextValue = Context.Folder
  }
}
