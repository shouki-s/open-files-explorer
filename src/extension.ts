// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { OpenEditorsTreeProvider } from './openEditorsTreeProvider';
import { OpenEditorItem } from './openEditorItem';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Hello Worldコマンドを登録
	const helloWorldCommand = vscode.commands.registerCommand('explorer.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from Explorer!');
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

	// ファイルを閉じるコマンドを登録
	const closeFileCommand = vscode.commands.registerCommand('structuredOpenEditors.closeFile', async (item: OpenEditorItem) => {
		if (!item?.resourceUri) {
			return;
		}

		// 指定されたURIを持つタブを探して閉じる
		for (const tabGroup of vscode.window.tabGroups.all) {
			for (const tab of tabGroup.tabs) {
				if (tab.input instanceof vscode.TabInputText && tab.input.uri.fsPath === item.resourceUri.fsPath) {
					await vscode.window.tabGroups.close(tab);
					break;
				}
			}
		}
	});

	// ピン留めを外すコマンドを登録
	const unpinEditorCommand = vscode.commands.registerCommand('structuredOpenEditors.unpinEditor', async (item: OpenEditorItem) => {
		if (!item?.resourceUri) {
			return;
		}

		// 指定されたURIを持つタブを探してピン留めを外す
		for (const tabGroup of vscode.window.tabGroups.all) {
			for (const tab of tabGroup.tabs) {
				if (tab.input instanceof vscode.TabInputText && tab.input.uri.fsPath === item.resourceUri.fsPath) {
					await vscode.commands.executeCommand('workbench.action.unpinEditor', tab.input.uri);
					break;
				}
			}
		}
	});

	// リフレッシュコマンドを登録
	const refreshCommand = vscode.commands.registerCommand('structuredOpenEditors.refreshView', () => {
		treeDataProvider.refresh();
	});

	// エクスプローラーの更新コマンドを登録
	const refreshExplorerCommand = vscode.commands.registerCommand('explorer.refreshExplorer', async () => {
		await vscode.commands.executeCommand('workbench.files.action.refreshFilesExplorer');
	});

	context.subscriptions.push(treeView, closeFileCommand, unpinEditorCommand, refreshCommand, refreshExplorerCommand, helloWorldCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
