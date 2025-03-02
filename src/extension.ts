import * as vscode from 'vscode';
import { closeFile, closeFolder, unpinEditor } from './commands/editorCommands';
import { FileDecorationProvider } from './providers/fileDecorationProvider';
import { OpenEditorsTreeProvider } from './providers/openEditorsTreeProvider';
import { getAllTabs } from './utils/tabUtils';
import { toOpenedFileUri } from './utils/uriUtils';

export function activate(context: vscode.ExtensionContext): void {
	const treeDataProvider = new OpenEditorsTreeProvider();
	const treeView = vscode.window.createTreeView('structuredOpenEditors', {
		treeDataProvider: treeDataProvider,
	});

	const decorationProvider = new FileDecorationProvider();

	registerEventHandlers(treeDataProvider, decorationProvider);
	registerCommands(context);

	context.subscriptions.push(
		treeView,
		vscode.window.registerFileDecorationProvider(decorationProvider),
	);
}

function registerEventHandlers(
	treeDataProvider: OpenEditorsTreeProvider,
	decorationProvider: FileDecorationProvider,
): void {
	vscode.window.tabGroups.onDidChangeTabs(() => {
		treeDataProvider.refresh();
		const changedUris = getAllTabs()
			.filter((tab) => tab.input instanceof vscode.TabInputText)
			.map((tab) => toOpenedFileUri((tab.input as vscode.TabInputText).uri));
		decorationProvider.updateDecorations(changedUris);
	});

	vscode.window.tabGroups.onDidChangeTabGroups(() =>
		treeDataProvider.refresh(),
	);
}

function registerCommands(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand(
			'structuredOpenEditors.closeFile',
			closeFile,
		),
		vscode.commands.registerCommand(
			'structuredOpenEditors.unpinEditor',
			unpinEditor,
		),
		vscode.commands.registerCommand(
			'structuredOpenEditors.closeFolder',
			closeFolder,
		),
	);
}

export function deactivate(): void {}
