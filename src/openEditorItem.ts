import * as vscode from 'vscode';

export class OpenEditorItem extends vscode.TreeItem {
	constructor(
		public readonly resourceUri: vscode.Uri,
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public children?: OpenEditorItem[],
		public readonly isDirty?: boolean,
		public readonly isPinned?: boolean
	) {
		super(resourceUri, collapsibleState);
		
		const fileName = resourceUri.path.split('/').pop() || '';
		
		if (children !== undefined) {
			this.contextValue = 'folder';
		} else {
			// ファイルを開くコマンドを設定
			this.command = {
				command: 'vscode.open',
				title: 'Open File',
				arguments: [this.resourceUri]
			};

			// その他のプロパティを設定
			const contextValues = ['file'];
			if (this.isPinned) {
				contextValues.push('pinnedFile');
			}
			this.contextValue = contextValues.join(' ');
			this.tooltip = fileName;

			// ステータスアイコンを追加
			const statusIcons = [];
			if (this.isDirty) {
				statusIcons.push('●');
			}
			if (this.isPinned) {
				statusIcons.push('📌');
			}
			this.description = statusIcons.join(' ');
		}
	}
} 