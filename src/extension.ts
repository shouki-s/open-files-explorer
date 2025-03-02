// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type FileItem from './items/fileItem';
import type FolderItem from './items/folderItem';
import { FileDecorationProvider } from './providers/fileDecorationProvider';
import { OpenEditorsTreeProvider } from './providers/openEditorsTreeProvider';
import { findTab } from './utils/tabUtils';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const treeDataProvider = new OpenEditorsTreeProvider();
	const treeView = vscode.window.createTreeView('structuredOpenEditors', {
		treeDataProvider: treeDataProvider,
	});

	const decorationProvider = new FileDecorationProvider();
	context.subscriptions.push(
		vscode.window.registerFileDecorationProvider(decorationProvider),
	);

	vscode.window.tabGroups.onDidChangeTabs(() => {
		treeDataProvider.refresh();
		// 変更されたタブのURIを取得して装飾を更新
		const changedUris = vscode.window.tabGroups.all
			.flatMap((group) => group.tabs)
			.filter((tab) => tab.input instanceof vscode.TabInputText)
			.map((tab) => (tab.input as vscode.TabInputText).uri);
		decorationProvider.updateDecorations(changedUris);
	});

	vscode.window.tabGroups.onDidChangeTabGroups(() =>
		treeDataProvider.refresh(),
	);

	const closeFileCommand = vscode.commands.registerCommand(
		'structuredOpenEditors.closeFile',
		closeFile,
	);

	const unpinEditorCommand = vscode.commands.registerCommand(
		'structuredOpenEditors.unpinEditor',
		unpinEditor,
	);

	const closeFolderCommand = vscode.commands.registerCommand(
		'structuredOpenEditors.closeFolder',
		closeFolder,
	);

	context.subscriptions.push(
		treeView,
		closeFileCommand,
		unpinEditorCommand,
		closeFolderCommand,
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}

async function closeFile(item: FileItem) {
	const tab = findTab(item.resourceUri);
	if (tab) {
		await vscode.window.tabGroups.close(tab);
	}
}

async function unpinEditor(item: FileItem) {
	const tab = findTab(item.resourceUri);
	if (tab?.input instanceof vscode.TabInputText) {
		await vscode.commands.executeCommand(
			'workbench.action.unpinEditor',
			tab.input.uri,
		);
	}
}

async function closeFolder(item: FolderItem) {
	const tabsToClose = vscode.window.tabGroups.all
		.flatMap((group) => group.tabs)
		.filter(
			(tab) =>
				tab.input instanceof vscode.TabInputText &&
				tab.input.uri.fsPath.startsWith(item.resourceUri.fsPath) &&
				!tab.isPinned,
		);
	await vscode.window.tabGroups.close(tabsToClose);
}
