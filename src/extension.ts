// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type FileItem from './items/fileItem';
import { OpenEditorsTreeProvider } from './openEditorsTreeProvider';
import { findTab } from './utils/tabUtils';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// ツリービューの登録
	const treeDataProvider = new OpenEditorsTreeProvider();
	const treeView = vscode.window.createTreeView('structuredOpenEditors', {
		treeDataProvider: treeDataProvider,
	});

	// タブの変更を監視して更新
	vscode.window.tabGroups.onDidChangeTabs(() => {
		treeDataProvider.refresh();
	});

	// ファイルを閉じるコマンドを登録
	const closeFileCommand = vscode.commands.registerCommand(
		'structuredOpenEditors.closeFile',
		closeFile,
	);

	// ピン留めを外すコマンドを登録
	const unpinEditorCommand = vscode.commands.registerCommand(
		'structuredOpenEditors.unpinEditor',
		unpinEditor,
	);

	// リフレッシュコマンドを登録
	const refreshCommand = vscode.commands.registerCommand(
		'structuredOpenEditors.refreshView',
		treeDataProvider.refresh,
	);

	context.subscriptions.push(
		treeView,
		closeFileCommand,
		unpinEditorCommand,
		refreshCommand,
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}

export async function closeFile(item: FileItem) {
	const tab = findTab(item.resourceUri);
	if (tab) {
		await vscode.window.tabGroups.close(tab);
	}
}

export async function unpinEditor(item: FileItem) {
	const tab = findTab(item.resourceUri);
	if (tab?.input instanceof vscode.TabInputText) {
		await vscode.commands.executeCommand(
			'workbench.action.unpinEditor',
			tab.input.uri,
		);
	}
}
