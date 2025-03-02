import * as vscode from 'vscode';
import BaseItem, { Context } from './baseItem';

export default class FileItem extends BaseItem {
	constructor(
		resourceUri: vscode.Uri,
		label: string,
		public readonly tab?: vscode.Tab,
	) {
		super(resourceUri, label, vscode.TreeItemCollapsibleState.None);

		// コンテキストを設定
		this.contexts = [Context.File];
		if (this.tab?.isPinned) {
			this.contexts.push(Context.PinnedFile);
		}

		// ファイルを開くコマンドを設定
		this.command = {
			command: 'vscode.open',
			title: 'Open File',
			arguments: [this.originalResourceUri],
		};

		// タブグループの情報を取得
		const tabGroupIndex = this.tab?.group
			? vscode.window.tabGroups.all.indexOf(this.tab.group) + 1
			: 0;

		// descriptionを構築
		if (vscode.window.tabGroups.all.length > 1 && tabGroupIndex > 0) {
			this.description = `(Group ${tabGroupIndex})`;
		}
	}
}
