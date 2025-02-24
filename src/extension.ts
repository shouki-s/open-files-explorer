// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "structured-open-editors" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('structured-open-editors.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from structured-open-editors!');
	});

	// ツリービューの登録
	const treeDataProvider = new OpenEditorsTreeProvider();
	const treeView = vscode.window.createTreeView('structuredOpenEditors', {
		treeDataProvider: treeDataProvider
	});

	// タブの変更を監視して更新
	vscode.window.tabGroups.onDidChangeTabs(() => {
		treeDataProvider.refresh();
	});

	context.subscriptions.push(disposable, treeView);
}

// This method is called when your extension is deactivated
export function deactivate() {}

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
						tab.input.uri
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
		Object.entries(fileTree).forEach(([folderPath, children]) => {
			if (folderPath === 'root') {
				rootItems.push(...children);
			} else {
				const folderItem = new OpenEditorItem(
					path.basename(folderPath),
					vscode.TreeItemCollapsibleState.Expanded,
					true
				);
				folderItem.children = children;
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

export class OpenEditorItem extends vscode.TreeItem {
	children?: OpenEditorItem[];

	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly isFolder: boolean = false,
		public readonly resourceUri?: vscode.Uri
	) {
		super(label, collapsibleState);

		if (isFolder) {
			this.iconPath = new vscode.ThemeIcon('folder');
		} else {
			this.iconPath = new vscode.ThemeIcon('file');
			this.command = {
				command: 'vscode.open',
				title: 'Open File',
				arguments: [resourceUri]
			};
		}
	}
}
