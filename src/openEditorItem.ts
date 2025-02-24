import * as vscode from 'vscode';

export class OpenEditorItem extends vscode.TreeItem {
	constructor(
		public readonly resourceUri: vscode.Uri,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly isFolder: boolean = false,
		public children?: OpenEditorItem[],
		public readonly isDirty?: boolean,
		public readonly isPinned?: boolean
	) {
		super(resourceUri, collapsibleState);
		
		const fileName = resourceUri.path.split('/').pop() || '';
		
		if (isFolder) {
			this.initializeAsFolder();
		} else {
			this.initializeAsFile(fileName);
			
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
					label: `${fileName} ${statusIcons.join(' ')}`,
					highlights: []
				};
			}
		}
	}

	private initializeAsFolder(): void {
		this.contextValue = 'folder';
	}

	private initializeAsFile(fileName: string): void {
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
	}
} 