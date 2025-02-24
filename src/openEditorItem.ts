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
		// まずsuperを呼び出す
		if (resourceUri) {
			super(resourceUri, collapsibleState);
		} else {
			super(labelText, collapsibleState);
		}
		
		if (isFolder) {
			this.initializeAsFolder();
		} else {
			this.initializeAsFile(labelText);
			
			// ファイルの場合、ラベルにステータスアイコンを追加
			const statusIcons = [];
			if (this.isDirty) {
				statusIcons.push('●');
			}
			if (this.isPinned) {
				statusIcons.push('📌');
			}
			if (statusIcons.length > 0) {
				this.label = {
					label: `${labelText} ${statusIcons.join(' ')}`,
					highlights: []
				};
			}
		}
	}

	private initializeAsFolder(): void {
		this.contextValue = 'folder';
	}

	private initializeAsFile(labelText: string): void {
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
		this.tooltip = labelText;
	}
} 