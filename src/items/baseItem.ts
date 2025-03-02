import * as vscode from 'vscode';
import { toOpenedFileUri } from '../utils/uriUtils';

export enum Context {
	File = 'file',
	Folder = 'folder',
	PinnedFile = 'pinnedFile',
}

export default abstract class BaseItem extends vscode.TreeItem {
	public readonly resourceUri: vscode.Uri;
	private _contexts: Context[] = [];

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

	protected get contexts(): Context[] {
		return this._contexts;
	}

	protected set contexts(values: Context[]) {
		this._contexts = values;
		this.contextValue = this._contexts.join(' ');
	}
}
