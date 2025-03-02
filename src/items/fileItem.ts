import * as vscode from 'vscode';
import BaseItem, { Context } from './baseItem';

export default class FileItem extends BaseItem {
	constructor(
		resourceUri: vscode.Uri,
		label: string,
		public readonly tab: vscode.Tab,
	) {
		super(resourceUri, label, vscode.TreeItemCollapsibleState.None);

		// コンテキストを設定
		this.contexts = [Context.File];
		if (this.tab.isPinned) {
			this.contexts.push(Context.PinnedFile);
		}

		// タブをフォーカスするコマンドを設定
		this.command = {
			command: 'vscode.tabGroups.focus',
			title: 'Focus Tab',
			arguments: [this.tab],
		};

		// タブグループの情報を取得
		const tabGroupIndex = this.tab.group
			? vscode.window.tabGroups.all.indexOf(this.tab.group) + 1
			: 0;

		// descriptionを構築
		if (vscode.window.tabGroups.all.length > 1 && tabGroupIndex > 0) {
			this.description = `(Group ${tabGroupIndex})`;
		}
	}
}
