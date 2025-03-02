import * as vscode from 'vscode';
import { toOpenedFileUri } from '../utils/uriUtils';
export default abstract class BaseItem extends vscode.TreeItem {
	public readonly resourceUri: vscode.Uri;

	constructor(
		public readonly originalResourceUri: vscode.Uri,
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly children: BaseItem[] = [],
	) {
		const openedFileUri = toOpenedFileUri(originalResourceUri);
		super(openedFileUri, collapsibleState);
		this.resourceUri = openedFileUri;
		this.tooltip = label;
	}
}
