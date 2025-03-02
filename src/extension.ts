import * as vscode from 'vscode';
import { closeFile, closeFolder, unpinEditor } from './commands/editorCommands';
import { OpenEditorsTreeProvider } from './providers/openEditorsTreeProvider';
import { getAllTabs } from './utils/tabUtils';
import { toOpenedFileUri } from './utils/uriUtils';

export function activate(context: vscode.ExtensionContext): void {
	const treeDataProvider = new OpenEditorsTreeProvider();
	const treeView = vscode.window.createTreeView('openFilesExplorer', {
		treeDataProvider,
	});
	registerEventHandlers(treeDataProvider);
	registerCommands(context);
	context.subscriptions.push(treeView);
}
function registerEventHandlers(
	treeDataProvider: OpenEditorsTreeProvider,
): void {
	vscode.window.tabGroups.onDidChangeTabs(() => {
		treeDataProvider.refresh();
	});

	vscode.window.tabGroups.onDidChangeTabGroups(() =>
		treeDataProvider.refresh(),
	);
}

function registerCommands(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand('openFilesExplorer.closeFile', closeFile),
		vscode.commands.registerCommand(
			'openFilesExplorer.unpinEditor',
			unpinEditor,
		),
		vscode.commands.registerCommand(
			'openFilesExplorer.closeFolder',
			closeFolder,
		),
	);
}

export function deactivate(): void {}
