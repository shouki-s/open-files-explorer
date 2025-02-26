import * as assert from 'node:assert';
import * as vscode from 'vscode';
import { OpenEditorsTreeProvider } from '../../src/openEditorsTreeProvider';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', function () {
	// テストのタイムアウトを設定
	this.timeout(30000);

	vscode.window.showInformationMessage('Start all tests.');

	setup(async () => {
		// 拡張機能のアクティベーションを待機
		const extension = vscode.extensions.getExtension(
			'shouki-s.structured-open-editors',
		);
		if (!extension) {
			throw new Error('Extension not found');
		}
		await extension.activate();
		await new Promise((resolve) => setTimeout(resolve, 1000));
	});

	teardown(async () => {});

	test('Tree View is registered', async () => {
		// 拡張機能の存在を確認
		const extension = vscode.extensions.getExtension(
			'shouki-s.structured-open-editors',
		);
		assert.ok(extension, 'Extension should be registered');
		assert.ok(extension.isActive, 'Extension should be active');

		// ツリービューの存在を確認
		const treeView = vscode.window.createTreeView('structuredOpenEditors', {
			treeDataProvider: new OpenEditorsTreeProvider(),
		});
		assert.ok(treeView, 'Tree view should be created');
	});
});
