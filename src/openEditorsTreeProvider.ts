import * as vscode from 'vscode';
import * as path from 'path';
import { OpenEditorItem } from './openEditorItem';

export class OpenEditorsTreeProvider implements vscode.TreeDataProvider<OpenEditorItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<OpenEditorItem | undefined | null | void> = new vscode.EventEmitter<OpenEditorItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<OpenEditorItem | undefined | null | void> = this._onDidChangeTreeData.event;

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: OpenEditorItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: OpenEditorItem): Promise<OpenEditorItem[]> {
		if (!element) {
			// ルートレベル：フォルダ構造を構築
			return this.getRootItems();
		}

		// フォルダアイテムの場合、子アイテムを返す
		if (element.isFolder) {
			return Promise.resolve(element.children || []);
		}

		return Promise.resolve([]);
	}

	private getRootItems(): OpenEditorItem[] {
		const workspaceFolders = vscode.workspace.workspaceFolders;

		if (!workspaceFolders || workspaceFolders.length === 0) {
			console.log('No workspace folders found');
			return [];
		}

		return workspaceFolders.map(folder =>
			new OpenEditorItem(
				folder.uri,
				vscode.TreeItemCollapsibleState.Expanded,
				true,
				this.getWorkspaceFolderItems(folder.uri.fsPath)
			)
		);
	}

	private getWorkspaceFolderItems(workspaceRoot: string): OpenEditorItem[] {
		const fileTree = this.buildFileTree(workspaceRoot);
		return this.createTreeStructure(fileTree);
	}

	private buildFileTree(workspaceRoot: string): { [key: string]: OpenEditorItem[] } {
		const fileTree: { [key: string]: OpenEditorItem[] } = {};

		const openEditors = this.getWorkspaceOpenEditors(workspaceRoot);
		openEditors.forEach(tab => {
			this.addFileToTree(fileTree, workspaceRoot, tab);
		});

		return fileTree;
	}

	private getWorkspaceOpenEditors(workspaceRoot: string): vscode.Tab[] {
		return vscode.window.tabGroups.all
			.flatMap(group => group.tabs)
			.filter(tab => tab.input instanceof vscode.TabInputText && tab.input.uri.fsPath.startsWith(workspaceRoot));
	}

	private addFileToTree(
		fileTree: { [key: string]: OpenEditorItem[] },
		workspaceRoot: string,
		tab: vscode.Tab
	): void {
		const input = tab.input as vscode.TabInputText;
		const relativePath = path.relative(workspaceRoot, input.uri.fsPath);
		const parts = relativePath.split(path.sep);
		const parentPath = path.dirname(relativePath);

		// フォルダ構造を構築
		for (let i = 0; i < parts.length - 1; i++) {
			const currentPath = parts.slice(0, i + 1).join(path.sep);
			if (!fileTree[currentPath]) {
				fileTree[currentPath] = [];
			}
		}

		// ファイルアイテムを作成
		const fileItem = new OpenEditorItem(
			input.uri,
			vscode.TreeItemCollapsibleState.None,
			false,
			undefined,
			tab.isDirty,
			tab.isPinned
		);

		// ファイルをツリーに追加
		const targetPath = parentPath === '.' ? 'root' : parentPath;
		if (!fileTree[targetPath]) {
			fileTree[targetPath] = [];
		}
		fileTree[targetPath].push(fileItem);
	}

	private createTreeStructure(fileTree: { [key: string]: OpenEditorItem[] }): OpenEditorItem[] {
		const rootItems: OpenEditorItem[] = [];

		Object.entries(fileTree).forEach(([folderPath, children]) => {
			if (folderPath === 'root') {
				rootItems.push(...children);
				return;
			}

			const folderItem = this.createFolderItem(folderPath, children);
			const parentPath = path.dirname(folderPath);

			if (parentPath === '.') {
				rootItems.push(folderItem);
			} else {
				if (!fileTree[parentPath]) {
					fileTree[parentPath] = [];
				}
				fileTree[parentPath].push(folderItem);
			}
		});

		return rootItems;
	}

	private createFolderItem(folderPath: string, children: OpenEditorItem[]): OpenEditorItem {
		const hasFiles = children.some(child => !child.isFolder);
		const hasFilesInSubfolders = children.some(child => 
			child.isFolder && child.children?.some(grandChild => !grandChild.isFolder)
		);

		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		if (!workspaceFolder) {
			throw new Error('No workspace folder found');
		}

		if (!hasFiles && !hasFilesInSubfolders && children.length === 1 && children[0].isFolder) {
			const childFolder = children[0];
			const combinedPath = path.join(folderPath, childFolder.label?.toString() || '');
			const uri = vscode.Uri.joinPath(workspaceFolder.uri, combinedPath);
			return new OpenEditorItem(
				uri,
				vscode.TreeItemCollapsibleState.Expanded,
				true,
				childFolder.children
			);
		}

		const uri = vscode.Uri.joinPath(workspaceFolder.uri, folderPath);
		return new OpenEditorItem(
			uri,
			vscode.TreeItemCollapsibleState.Expanded,
			true,
			children
		);
	}
} 