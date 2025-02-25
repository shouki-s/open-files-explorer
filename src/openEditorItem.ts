import * as vscode from 'vscode';

export class OpenEditorItem extends vscode.TreeItem {
	constructor(
		public readonly resourceUri: vscode.Uri,
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public children?: OpenEditorItem[],
		public readonly tab?: vscode.Tab
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
			if (this.tab?.isPinned) {
				contextValues.push('pinnedFile');
			}
			this.contextValue = contextValues.join(' ');
			this.tooltip = fileName;

			// ステータスアイコンを追加
			const statusIcons = [];
			if (this.tab?.isDirty) {
				statusIcons.push('●');
			}
			if (this.tab?.isPinned) {
				statusIcons.push('📌');
			}

			// タブグループの情報を取得
			const tabGroupIndex = this.tab?.group ? vscode.window.tabGroups.all.indexOf(this.tab.group) + 1 : 0;
			
			// descriptionを構築
			const description = [];
			if (statusIcons.length > 0) {
				description.push(statusIcons.join(' '));
			}
			if (vscode.window.tabGroups.all.length > 1 && tabGroupIndex > 0) {
				description.push(`(Group ${tabGroupIndex})`);
			}

			this.description = description.join(' ');
		}
	}
} 