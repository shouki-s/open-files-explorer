import * as assert from 'node:assert';
import * as vscode from 'vscode';
import FileItem from '../../../src/items/fileItem';
import FolderItem from '../../../src/items/folderItem';

suite('FolderItem Test Suite', () => {
	test('FolderItemが正しく初期化される', () => {
		const uri = vscode.Uri.file('/test/folder');
		const label = 'folder';
		const children: FileItem[] = [];

		const folderItem = new FolderItem(uri, label, children);

		assert.strictEqual(folderItem.label, label);
		assert.strictEqual(folderItem.resourceUri, uri);
		assert.strictEqual(
			folderItem.collapsibleState,
			vscode.TreeItemCollapsibleState.Expanded,
		);
		assert.strictEqual(folderItem.contextValue, 'folder');
	});

	test('子アイテムが正しく設定される', () => {
		const uri = vscode.Uri.file('/test/folder');
		const label = 'folder';

		const fileUri = vscode.Uri.file('/test/folder/file.ts');
		const fileTab = {
			input: {
				uri: fileUri,
			},
		} as vscode.Tab;
		const fileItem = new FileItem(fileUri, 'file.ts', fileTab);

		const children = [fileItem];
		const folderItem = new FolderItem(uri, label, children);

		assert.strictEqual(folderItem.children.length, 1);
		assert.strictEqual(folderItem.children[0], fileItem);
	});

	test('空のフォルダは折りたたまれた状態で初期化される', () => {
		const uri = vscode.Uri.file('/test/folder');
		const label = 'folder';
		const children: FileItem[] = [];

		const folderItem = new FolderItem(uri, label, children);

		assert.strictEqual(
			folderItem.collapsibleState,
			vscode.TreeItemCollapsibleState.Expanded,
		);
	});
});
