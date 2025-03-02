import * as vscode from 'vscode';

export interface UriTab extends vscode.Tab {
	input: {
		uri: vscode.Uri;
	};
}

export function getAllTabs(): vscode.Tab[] {
	return vscode.window.tabGroups.all.flatMap((group) => group.tabs);
}

export function findTab(uri: vscode.Uri): vscode.Tab | undefined {
	return getAllTabs().find(
		(tab) => isUriTab(tab) && tab.input.uri.fsPath === uri.fsPath,
	);
}

export function isUriTab(tab: vscode.Tab): tab is UriTab {
	return tab.input instanceof vscode.TabInputText;
}

export function getWorkspaceOpenEditorTabs(workspaceRoot: string): UriTab[] {
	return getAllTabs()
		.filter(isUriTab)
		.filter((tab) => tab.input.uri.fsPath.startsWith(workspaceRoot))
		.sort((a, b) => {
			const aPath = a.input.uri.fsPath;
			const bPath = b.input.uri.fsPath;
			return aPath.localeCompare(bPath);
		});
}
