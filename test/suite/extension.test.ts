import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { OpenEditorsTreeProvider } from '../../src/openEditorsTreeProvider';
import BaseItem from '../../src/items/baseItem';
import FolderItem from '../../src/items/folderItem';
import FileItem from '../../src/items/fileItem';

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

	test('Files are organized by folders', async function(this: Mocha.Context) {
		this.timeout(10000);

		// ワークスペースの確認
		const workspace = vscode.workspace.workspaceFolders?.[0];
		console.log('Current workspace:', workspace);

		if (!workspace) {
			throw new Error('No workspace folder is opened');
		}

		// テスト用のファイルを開く
		const testFiles = [
			'src/extension.ts',
			'test/suite/extension.test.ts',
			'package.json'
		].map(f => vscode.Uri.file(path.join(workspace.uri.fsPath, f)));

		// ファイルを開く
		for (const file of testFiles) {
			console.log('Opening file:', file.fsPath);
			const doc = await vscode.workspace.openTextDocument(file);
			await vscode.window.showTextDocument(doc);
			await new Promise(resolve => setTimeout(resolve, 500)); // 各ファイルを開いた後に待機
		}

		// ツリービューの更新を待機
		await new Promise(resolve => setTimeout(resolve, 2000));

		// ツリービューのデータを取得
		const provider = new OpenEditorsTreeProvider();
		const rootItems = await provider.getChildren();

		console.log('Root items:', rootItems);

		// ルートレベルのアイテムをチェック
		assert.ok(rootItems && rootItems.length > 0, 'Root items should not be empty');

		// srcフォルダが存在することを確認
		const srcFolder = rootItems.find((item: BaseItem) => item.label === 'src');
		assert.ok(srcFolder);
		assert.ok(srcFolder instanceof FolderItem);

		// srcフォルダの子アイテムをチェック
		if (srcFolder instanceof FolderItem) {
			const srcChildren = await provider.getChildren(srcFolder);
			assert.ok(srcChildren.length > 0);
			assert.ok(srcChildren.some((child: BaseItem) => 
				child instanceof FileItem && child.label === 'extension.ts'
			));
		}
	});

	test('File items have correct properties', async () => {
		const provider = new OpenEditorsTreeProvider();
		const rootItems = await provider.getChildren();

		// ファイルアイテムのプロパティをチェック
		const fileItem = rootItems.find((item: BaseItem) => item instanceof FileItem);
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
		const folderItem = rootItems.find((item: BaseItem) => item instanceof FolderItem);
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