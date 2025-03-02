import * as vscode from 'vscode';
import BaseItem from './baseItem';

export default class FolderItem extends BaseItem {
	constructor(resourceUri: vscode.Uri, label: string, children: BaseItem[]) {
		super(
			resourceUri,
			label,
			vscode.TreeItemCollapsibleState.Expanded,
			children,
		);
		this.contextValues = ['folder'];
	}
}
