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

	getChildren(element?: OpenEditorItem): Thenable<OpenEditorItem[]> {
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

	private getRootItems(): Thenable<OpenEditorItem[]> {
		const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (!workspaceRoot) {
			console.log('No workspace root found');
			return Promise.resolve([]);
		}

		const fileTree: { [key: string]: OpenEditorItem[] } = {};
		
		// デバッグ用のログ
		console.log('Workspace root:', workspaceRoot);
		console.log('Tab groups:', vscode.window.tabGroups.all);

		// 開いているタブをフォルダ構造に整理
		vscode.window.tabGroups.all.forEach(group => {
			group.tabs.forEach(tab => {
				if (tab.input instanceof vscode.TabInputText) {
					const filePath = tab.input.uri.fsPath;
					const relativePath = path.relative(workspaceRoot, filePath);
					const parts = relativePath.split(path.sep);
					
					let currentPath = '';
					let currentItems = fileTree;
					
					// フォルダ構造を構築
					for (let i = 0; i < parts.length - 1; i++) {
						const part = parts[i];
						currentPath = currentPath ? path.join(currentPath, part) : part;
						
						if (!currentItems[currentPath]) {
							currentItems[currentPath] = [];
						}
					}

					// ファイルアイテムを作成
					const fileItem = new OpenEditorItem(
						parts[parts.length - 1],
						vscode.TreeItemCollapsibleState.None,
						false,
						tab.input.uri,
						undefined,
						tab.isDirty,
						tab.isPinned
					);

					// 最後のフォルダに追加
					const parentPath = path.dirname(relativePath);
					if (parentPath === '.') {
						if (!fileTree['root']) {
							fileTree['root'] = [];
						}
						fileTree['root'].push(fileItem);
					} else {
						if (!fileTree[parentPath]) {
							fileTree[parentPath] = [];
						}
						fileTree[parentPath].push(fileItem);
					}
				}
			});
		});

		// フォルダツリーを構築
		const rootItems: OpenEditorItem[] = [];
		const processFolder = (folderPath: string, children: OpenEditorItem[]): OpenEditorItem => {
			// 開いているエディタのパスのみを考慮して、単一のフォルダを持つ場合の処理
			const nonEmptyChildren = children.filter(child => {
				// フォルダの場合、その中に実際のファイルが含まれているかチェック
				if (child.isFolder) {
					return child.children && child.children.some(grandChild => !grandChild.isFolder);
				}
				return true; // ファイルの場合はそのまま含める
			});

			if (nonEmptyChildren.length === 0 && children.length === 1 && children[0].isFolder) {
				const childFolder = children[0];
				const combinedPath = path.join(folderPath, childFolder.label.toString());
				return new OpenEditorItem(
					combinedPath,
					vscode.TreeItemCollapsibleState.Expanded,
					true,
					undefined,
					childFolder.children
				);
			}

			// 通常のフォルダ処理
			return new OpenEditorItem(
				path.basename(folderPath),
				vscode.TreeItemCollapsibleState.Expanded,
				true,
				undefined,
				children
			);
		};

		Object.entries(fileTree).forEach(([folderPath, children]) => {
			if (folderPath === 'root') {
				rootItems.push(...children);
			} else {
				const folderItem = processFolder(folderPath, children);
				const parentPath = path.dirname(folderPath);
				if (parentPath === '.') {
					rootItems.push(folderItem);
				} else {
					if (!fileTree[parentPath]) {
						fileTree[parentPath] = [];
					}
					fileTree[parentPath].push(folderItem);
				}
			}
		});

		return Promise.resolve(rootItems);
	}
} 