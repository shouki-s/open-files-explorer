import * as assert from 'node:assert';
import * as vscode from 'vscode';
import { OpenEditorsTreeProvider } from '../../../src/providers/openEditorsTreeProvider';
import { createTestEditor } from '../../helpers/testUtils';

suite('OpenEditorsTreeProvider Test Suite', () => {
	let provider: OpenEditorsTreeProvider;

	setup(async function () {
		this.timeout(10000); // タイムアウトを10秒に設定
		provider = new OpenEditorsTreeProvider();
	});

	teardown(async function () {
		this.timeout(10000); // タイムアウトを10秒に設定
	});

	test('エディタを開くとツリーアイテムが作成される', async () => {
		await createTestEditor('test content', 'typescript');
		provider.refresh(); // ツリーを更新
		const root = provider.getChildren();

		// ワークスペースフォルダが存在する場合のみテスト
		if (
			vscode.workspace.workspaceFolders &&
			vscode.workspace.workspaceFolders.length > 0
		) {
			assert.strictEqual(root.length, 1);
			const folder = root[0];
			const children = provider.getChildren(folder);
			assert.strictEqual(children.length, 1); // 1つのファイル
			assert.strictEqual(children[0].label, 'Untitled-1');
		}
	});

	test('TreeItemが正しく取得できる', async () => {
		await createTestEditor('test content', 'typescript');
		provider.refresh();
		const root = provider.getChildren();

		if (
			vscode.workspace.workspaceFolders &&
			vscode.workspace.workspaceFolders.length > 0
		) {
			const folder = root[0];
			const treeItem = provider.getTreeItem(folder);
			assert.strictEqual(
				treeItem.collapsibleState,
				vscode.TreeItemCollapsibleState.Expanded,
			);
		}
	});

	test('エディタを閉じるとツリーアイテムが削除される', async () => {
		await createTestEditor('test content');
		provider.refresh();
		let root = provider.getChildren();

		if (
			vscode.workspace.workspaceFolders &&
			vscode.workspace.workspaceFolders.length > 0
		) {
			assert.strictEqual(provider.getChildren(root[0]).length, 1);
			await vscode.commands.executeCommand(
				'workbench.action.closeActiveEditor',
			);
			provider.refresh();
			root = provider.getChildren();
			assert.strictEqual(provider.getChildren(root[0]).length, 0);
		}
	});
});
