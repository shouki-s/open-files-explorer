// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

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

class OpenEditorsTreeProvider implements vscode.TreeDataProvider<OpenEditorItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<OpenEditorItem | undefined | null | void> = new vscode.EventEmitter<OpenEditorItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<OpenEditorItem | undefined | null | void> = this._onDidChangeTreeData.event;

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: OpenEditorItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: OpenEditorItem): Thenable<OpenEditorItem[]> {
		if (element) {
			return Promise.resolve([]);
		}

		const editors = vscode.window.tabGroups.all.flatMap(group => 
			group.tabs.map(tab => new OpenEditorItem(
				tab.label,
				vscode.TreeItemCollapsibleState.None
			))
		);

		return Promise.resolve(editors);
	}
}

class OpenEditorItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState
	) {
		super(label, collapsibleState);
	}
}
