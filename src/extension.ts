// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type FileItem from './items/fileItem';
import { OpenEditorsTreeProvider } from './openEditorsTreeProvider';
import { findTab } from './utils/tabUtils';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const treeDataProvider = new OpenEditorsTreeProvider();
	const treeView = vscode.window.createTreeView('structuredOpenEditors', {
		treeDataProvider: treeDataProvider,
	});

	vscode.window.tabGroups.onDidChangeTabs(treeDataProvider.refresh);

	const closeFileCommand = vscode.commands.registerCommand(
		'structuredOpenEditors.closeFile',
		closeFile,
	);

	const unpinEditorCommand = vscode.commands.registerCommand(
		'structuredOpenEditors.unpinEditor',
		unpinEditor,
	);

	context.subscriptions.push(treeView, closeFileCommand, unpinEditorCommand);
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
