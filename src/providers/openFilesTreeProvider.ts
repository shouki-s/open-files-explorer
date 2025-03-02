import * as path from 'node:path'
import * as vscode from 'vscode'
import type BaseItem from '../items/baseItem'
import FileItem from '../items/fileItem'
import FolderItem from '../items/folderItem'
import { type UriTab, getWorkspaceOpenEditorTabs } from '../utils/tabUtils'

interface FileTreeNode {
  name: string
  children: Map<string, FileTreeNode>
  items: FileItem[]
}

export class OpenFilesTreeProvider
  implements vscode.TreeDataProvider<BaseItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    BaseItem | undefined | null
  > = new vscode.EventEmitter<BaseItem | undefined | null>()
  readonly onDidChangeTreeData: vscode.Event<BaseItem | undefined | null> =
    this._onDidChangeTreeData.event

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined)
  }

  getTreeItem(element: BaseItem): vscode.TreeItem {
    return element
  }

  getChildren(element?: BaseItem): BaseItem[] {
    if (element) {
      return element.children
    }
    // Root level: Build folder structure
    return this.getRootItems()
  }

  private getRootItems(): BaseItem[] {
    const workspaceFolders = vscode.workspace.workspaceFolders
    if (!workspaceFolders || workspaceFolders.length === 0) {
      console.log('No workspace folders found')
      return []
    }

    return workspaceFolders.map((folder) => this.getWorkspaceFolderItem(folder))
  }

  private getWorkspaceFolderItem(
    workspaceFolder: vscode.WorkspaceFolder,
  ): FolderItem {
    const workspaceRoot = workspaceFolder.uri.fsPath
    const fileTree = this.buildFileTree(workspaceRoot)
    const compactedTree = this.compactFolders(fileTree)
    return this.createFolderItem(
      compactedTree.name,
      compactedTree,
      workspaceFolder.uri,
    )
  }

  private buildFileTree(workspaceRoot: string): FileTreeNode {
    const root: FileTreeNode = {
      name: workspaceRoot.split('/').pop() || '',
      children: new Map(),
      items: [],
    }

    const openEditors = getWorkspaceOpenEditorTabs(workspaceRoot)
    for (const tab of openEditors) {
      this.addFileToTree(root, workspaceRoot, tab)
    }

    return root
  }

  private addFileToTree(
    root: FileTreeNode,
    workspaceRoot: string,
    tab: UriTab,
  ): void {
    const uri = tab.input.uri
    const relativePath = path.relative(workspaceRoot, uri.fsPath)
    const parts = relativePath.split(path.sep)

    let currentNode = root
    // Build folder structure
    for (let i = 0; i < parts.length - 1; i++) {
      const folderName = parts[i]
      const existingNode = currentNode.children.get(folderName)
      if (existingNode) {
        currentNode = existingNode
      } else {
        const nextNode = {
          name: folderName,
          children: new Map(),
          items: [],
        }
        currentNode.children.set(folderName, nextNode)
        currentNode = nextNode
      }
    }

    // Create file item
    const fileItem = new FileItem(uri, uri.fsPath.split('/').pop() || '', tab)

    // Add file to current node
    currentNode.items.push(fileItem)
  }

  private compactFolders(node: FileTreeNode): FileTreeNode {
    // Compact if node has a single child folder and no files
    if (node.items.length === 0 && node.children.size === 1) {
      const [childName, childNode] = Array.from(node.children.entries())[0]
      const newNode: FileTreeNode = {
        name: `${node.name}/${childName}`,
        children: childNode.children,
        items: childNode.items,
      }
      return this.compactFolders(newNode)
    }

    const compactedChildren = new Map<string, FileTreeNode>()
    for (const [name, child] of node.children.entries()) {
      const compactedChild = this.compactFolders(child)
      compactedChildren.set(compactedChild.name, compactedChild)
    }

    return {
      name: node.name,
      children: compactedChildren,
      items: node.items,
    }
  }

  private createFolderItem(
    name: string,
    node: FileTreeNode,
    folderUri: vscode.Uri,
  ): FolderItem {
    const children: BaseItem[] = [
      ...Array.from(node.children.entries()).map(([childName, childNode]) =>
        this.createFolderItem(
          childName,
          childNode,
          vscode.Uri.joinPath(folderUri, childName),
        ),
      ),
      ...node.items,
    ]

    return new FolderItem(folderUri, name, children)
  }
}
