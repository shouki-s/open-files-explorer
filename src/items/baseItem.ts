import * as vscode from 'vscode';

export default abstract class BaseItem extends vscode.TreeItem {
	constructor(
		public readonly resourceUri: vscode.Uri,
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly children: BaseItem[] = []
	) {
		super(resourceUri, collapsibleState);
		this.tooltip = label;
	}
} 