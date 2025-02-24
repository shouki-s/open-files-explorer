import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { OpenEditorsTreeProvider, OpenEditorItem } from '../../src/extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Starting test suite.');

	test('Tree View is registered', async () => {
		// ビューが登録されているか確認
		const view = vscode.window.createTreeView('structuredOpenEditors', {
			treeDataProvider: new MockTreeDataProvider()
		});
		assert.ok(view);
		view.dispose();
	});

	test('Files are organized by folders', async () => {
		// テスト用のファイルを開く
		const workspaceRoot = vscode.workspace.workspaceFolders![0].uri.fsPath;
		const testFiles = [
			path.join(workspaceRoot, 'src/extension.ts'),
			path.join(workspaceRoot, 'src/test/suite/extension.test.ts'),
			path.join(workspaceRoot, 'package.json')
		];

		// ファイルを開く
		for (const file of testFiles) {
			const doc = await vscode.workspace.openTextDocument(file);
			await vscode.window.showTextDocument(doc);
		}

		// ツリービューのデータを取得
		const provider = new OpenEditorsTreeProvider();
		const rootItems = await provider.getChildren();

		// ルートレベルのアイテムをチェック
		assert.ok(rootItems.length > 0);

		// srcフォルダが存在することを確認
		const srcFolder = rootItems.find((item: OpenEditorItem) => item.label === 'src');
		assert.ok(srcFolder);
		assert.strictEqual(srcFolder.isFolder, true);

		// srcフォルダの子アイテムをチェック
		if (srcFolder?.isFolder) {
			const srcChildren = await provider.getChildren(srcFolder);
			assert.ok(srcChildren.length > 0);
			assert.ok(srcChildren.some((child: OpenEditorItem) => child.label === 'extension.ts'));
		}
	});

	test('File items have correct properties', async () => {
		const provider = new OpenEditorsTreeProvider();
		const rootItems = await provider.getChildren();

		// ファイルアイテムのプロパティをチェック
		const fileItem = rootItems.find(item => !item.isFolder);
		if (fileItem) {
			assert.strictEqual(fileItem.collapsibleState, vscode.TreeItemCollapsibleState.None);
			assert.ok(fileItem.command);
			assert.strictEqual(fileItem.command.command, 'vscode.open');
		}
	});

	test('Folder items have correct properties', async () => {
		const provider = new OpenEditorsTreeProvider();
		const rootItems = await provider.getChildren();

		// フォルダアイテムのプロパティをチェック
		const folderItem = rootItems.find(item => item.isFolder);
		if (folderItem) {
			assert.strictEqual(folderItem.collapsibleState, vscode.TreeItemCollapsibleState.Expanded);
			assert.ok(!folderItem.command);
		}
	});
});

// モックツリーデータプロバイダー（テスト用）
class MockTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	onDidChangeTreeData?: vscode.Event<void | vscode.TreeItem | null | undefined>;
	
	getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}
	
	getChildren(element?: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
		return [];
	}
} 