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
			this.initializeAsFolder();
		} else {
			this.initializeAsFile(labelText);
		}
	}

	private initializeAsFolder(): void {
		this.iconPath = new vscode.ThemeIcon('folder');
	}

	private initializeAsFile(labelText: string): void {
		// ファイルの状態に応じたアイコンを設定
		this.setFileIcon();

		// ファイルを開くコマンドを設定
		this.setFileCommand();

		// その他のプロパティを設定
		const contextValues = ['file'];
		if (this.isPinned) {
			contextValues.push('pinnedFile');
		}
		this.contextValue = contextValues.join(' ');
		this.tooltip = labelText;
	}

	private setFileIcon(): void {
		if (!this.isDirty && !this.isPinned) {
			return;
		}

		const iconName = this.getStateIconName();
		this.iconPath = new vscode.ThemeIcon(iconName);
	}

	private getStateIconName(): string {
		if (this.isDirty && this.isPinned) {
			return 'pinned-dirty';
		}
		if (this.isDirty) {
			return 'circle-filled';
		}
		return 'pin';
	}

	private setFileCommand(): void {
		this.command = {
			command: 'vscode.open',
			title: 'Open File',
			arguments: [this.resourceUri]
		};
	}
} 