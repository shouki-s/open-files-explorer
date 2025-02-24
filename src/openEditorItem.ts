import * as vscode from 'vscode';

export class OpenEditorItem extends vscode.TreeItem {
	constructor(
		labelText: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly isFolder: boolean = false,
		public readonly resourceUri?: vscode.Uri,
		public children?: OpenEditorItem[],
		public readonly isDirty?: boolean,
		public readonly isPinned?: boolean
	) {
		super(labelText, collapsibleState);

		if (isFolder) {
			this.iconPath = new vscode.ThemeIcon('folder');
		} else {
			if (isDirty || isPinned) {
				const icon = isDirty && isPinned ? 'pinned-dirty' :
					isDirty ? 'circle-filled' :
					'pin';
				this.iconPath = new vscode.ThemeIcon(icon);
			}

			this.command = {
				command: 'vscode.open',
				title: 'Open File',
				arguments: [resourceUri]
			};
			this.contextValue = 'file';
			this.tooltip = labelText;
		}
	}
} 