import * as vscode from 'vscode';

function getAllTabs(): vscode.Tab[] {
	return vscode.window.tabGroups.all.flatMap((group) => group.tabs);
}

export function findTab(uri: vscode.Uri): vscode.Tab | undefined {
	return getAllTabs().find(
		(tab) =>
			tab.input instanceof vscode.TabInputText &&
			tab.input.uri.fsPath === uri.fsPath,
	);
}

export function getWorkspaceOpenEditorTabs(
	workspaceRoot: string,
): vscode.Tab[] {
	return getAllTabs()
		.filter(
			(tab, index, self) =>
				tab.input instanceof vscode.TabInputText &&
				tab.input.uri.fsPath.startsWith(workspaceRoot) &&
				// 重複を削除
				index ===
					self.findIndex(
						(t) =>
							(t.input as vscode.TabInputText).uri.fsPath ===
							(tab.input as vscode.TabInputText).uri.fsPath,
					),
		)
		.sort((a, b) => {
			const aPath = (a.input as vscode.TabInputText).uri.fsPath;
			const bPath = (b.input as vscode.TabInputText).uri.fsPath;
			return aPath.localeCompare(bPath);
		});
}
