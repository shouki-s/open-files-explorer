import * as vscode from 'vscode';

export class OpenEditorItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly isFolder: boolean = false,
		public readonly resourceUri?: vscode.Uri,
		public children?: OpenEditorItem[]
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