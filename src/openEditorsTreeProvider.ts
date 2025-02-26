import * as path from 'node:path';
import * as vscode from 'vscode';
import type BaseItem from './items/baseItem';
import FileItem from './items/fileItem';
import FolderItem from './items/folderItem';
import { getWorkspaceOpenEditorTabs } from './utils/tabUtils';

interface FileTreeNode {
	name: string;
	children: Map<string, FileTreeNode>;
	items: FileItem[];
}

export class OpenEditorsTreeProvider
	implements vscode.TreeDataProvider<BaseItem>
{
	private _onDidChangeTreeData: vscode.EventEmitter<
		BaseItem | undefined | null
	> = new vscode.EventEmitter<BaseItem | undefined | null>();
	readonly onDidChangeTreeData: vscode.Event<BaseItem | undefined | null> =
		this._onDidChangeTreeData.event;

	refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
	}

	getTreeItem(element: BaseItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: BaseItem): BaseItem[] {
		if (element) {
			return element.children;
		}
		// ルートレベル：フォルダ構造を構築
		return this.getRootItems();
	}

	private getRootItems(): BaseItem[] {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || workspaceFolders.length === 0) {
			console.log('No workspace folders found');
			return [];
		}

		return workspaceFolders.map((folder) =>
			this.getWorkspaceFolderItem(folder),
		);
	}

	private getWorkspaceFolderItem(
		workspaceFolder: vscode.WorkspaceFolder,
	): FolderItem {
		const workspaceRoot = workspaceFolder.uri.fsPath;
		const fileTree = this.buildFileTree(workspaceRoot);
		const compactedTree = this.compactFolders(fileTree);
		return this.createFolderItem(
			compactedTree.name,
			compactedTree,
			workspaceFolder,
		);
	}

	private buildFileTree(workspaceRoot: string): FileTreeNode {
		const root: FileTreeNode = {
			name: workspaceRoot.split('/').pop() || '',
			children: new Map(),
			items: [],
		};

		const openEditors = getWorkspaceOpenEditorTabs(workspaceRoot);
		for (const tab of openEditors) {
			this.addFileToTree(root, workspaceRoot, tab);
		}

		return root;
	}

	private addFileToTree(
		root: FileTreeNode,
		workspaceRoot: string,
		tab: vscode.Tab,
	): void {
		const input = tab.input as vscode.TabInputText;
		const relativePath = path.relative(workspaceRoot, input.uri.fsPath);
		const parts = relativePath.split(path.sep);

		let currentNode = root;
		// フォルダ構造を構築
		for (let i = 0; i < parts.length - 1; i++) {
			const folderName = parts[i];
			const existingNode = currentNode.children.get(folderName);
			if (existingNode) {
				currentNode = existingNode;
			} else {
				const nextNode = {
					name: folderName,
					children: new Map(),
					items: [],
				};
				currentNode.children.set(folderName, nextNode);
				currentNode = nextNode;
			}
		}

		// ファイルアイテムを作成
		const fileItem = new FileItem(
			input.uri,
			input.uri.fsPath.split('/').pop() || '',
			tab,
		);

		// ファイルを現在のノードに追加
		currentNode.items.push(fileItem);
	}

	private compactFolders(node: FileTreeNode): FileTreeNode {
		// 単一の子フォルダを持ち、ファイルを持たない場合はコンパクト化
		if (node.items.length === 0 && node.children.size === 1) {
			const [childName, childNode] = Array.from(node.children.entries())[0];
			const newNode: FileTreeNode = {
				name: `${node.name}/${childName}`,
				children: childNode.children,
				items: childNode.items,
			};
			return this.compactFolders(newNode);
		}

		const compactedChildren = new Map<string, FileTreeNode>();
		for (const [name, child] of node.children.entries()) {
			const compactedChild = this.compactFolders(child);
			compactedChildren.set(compactedChild.name, compactedChild);
		}

		return {
			name: node.name,
			children: compactedChildren,
			items: node.items,
		};
	}

	private createFolderItem(
		name: string,
		node: FileTreeNode,
		workspaceFolder: vscode.WorkspaceFolder,
	): FolderItem {
		const folderUri = vscode.Uri.joinPath(workspaceFolder.uri, name);
		const children: BaseItem[] = [
			...Array.from(node.children.entries()).map(([childName, childNode]) =>
				this.createFolderItem(childName, childNode, workspaceFolder),
			),
			...node.items,
		];

		return new FolderItem(folderUri, name, children);
	}
}
