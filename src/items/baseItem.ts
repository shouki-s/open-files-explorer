import * as vscode from 'vscode';

export default abstract class BaseItem extends vscode.TreeItem {
	public readonly resourceUri: vscode.Uri;

	constructor(
		public readonly originalResourceUri: vscode.Uri,
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly children: BaseItem[] = [],
	) {
		const openedFileUri = vscode.Uri.from({
			...originalResourceUri,
			scheme: 'opened-file',
		});
		super(openedFileUri, collapsibleState);
		this.resourceUri = openedFileUri;
		this.tooltip = label;
	}
}
