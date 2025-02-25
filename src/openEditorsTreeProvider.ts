import * as vscode from 'vscode';
import * as path from 'path';
import { OpenEditorItem } from './openEditorItem';
import { getWorkspaceOpenEditorTabs } from './utils/tabUtils';

interface FileTreeNode {
	name: string;
	children: Map<string, FileTreeNode>;
	items: OpenEditorItem[];
}

export class OpenEditorsTreeProvider implements vscode.TreeDataProvider<OpenEditorItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<OpenEditorItem | undefined | null | void> = new vscode.EventEmitter<OpenEditorItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<OpenEditorItem | undefined | null | void> = this._onDidChangeTreeData.event;

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: OpenEditorItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: OpenEditorItem): OpenEditorItem[] {
		if (!element) {
			// ルートレベル：フォルダ構造を構築
			return this.getRootItems();
		}

		return element.children || [];
	}

	private getRootItems(): OpenEditorItem[] {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || workspaceFolders.length === 0) {
			console.log('No workspace folders found');
			return [];
		}

		return workspaceFolders
			.map(folder => this.getWorkspaceFolderItem(folder));
		}

	private getWorkspaceFolderItem(workspaceFolder: vscode.WorkspaceFolder): OpenEditorItem {
		const workspaceRoot = workspaceFolder.uri.fsPath;
		const fileTree = this.buildFileTree(workspaceRoot);
		const compactedTree = this.compactFolders(fileTree);
		return this.createOpenEditorItem(compactedTree.name, compactedTree, workspaceFolder);
	}

	private buildFileTree(workspaceRoot: string): FileTreeNode {
		const root: FileTreeNode = {
			name: workspaceRoot.split('/').pop() || '',
			children: new Map(),
			items: []
		};

		const openEditors = getWorkspaceOpenEditorTabs(workspaceRoot);
		openEditors.forEach(tab => {
			this.addFileToTree(root, workspaceRoot, tab);
		});

		return root;
	}

	private addFileToTree(
		root: FileTreeNode,
		workspaceRoot: string,
		tab: vscode.Tab
	): void {
		const input = tab.input as vscode.TabInputText;
		const relativePath = path.relative(workspaceRoot, input.uri.fsPath);
		const parts = relativePath.split(path.sep);

		let currentNode = root;
		// フォルダ構造を構築
		for (let i = 0; i < parts.length - 1; i++) {
			const folderName = parts[i];
			if (!currentNode.children.has(folderName)) {
				currentNode.children.set(folderName, {
					name: folderName,
					children: new Map(),
					items: []
				});
			}
			currentNode = currentNode.children.get(folderName)!;
		}

		// ファイルアイテムを作成
		const fileItem = new OpenEditorItem(
			input.uri,
			input.uri.fsPath.split('/').pop() || '',
			vscode.TreeItemCollapsibleState.None,
			undefined,
			tab.isDirty,
			tab.isPinned
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
				items: childNode.items
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
			items: node.items
		};
	}

	private createOpenEditorItem(
		name: string,
		node: FileTreeNode,
		workspaceFolder: vscode.WorkspaceFolder
	): OpenEditorItem {
		const folderUri = vscode.Uri.joinPath(workspaceFolder.uri, name);
		const children: OpenEditorItem[] = [
			...Array.from(node.children.entries()).map(([childName, childNode]) =>
				this.createOpenEditorItem(childName, childNode, workspaceFolder)
			),
			...node.items,
		];

		return new OpenEditorItem(
			folderUri,
			name,
			vscode.TreeItemCollapsibleState.Expanded,
			children
		);
	}
} 