import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as vscode from 'vscode';

export async function createTestEditor(
	content: string,
	language?: string,
): Promise<vscode.TextEditor> {
	const document = await vscode.workspace.openTextDocument({
		content,
		language,
	});
	return await vscode.window.showTextDocument(document);
}

export async function createTestWorkspace(): Promise<void> {
	let tmpWorkspacePath: string | undefined;
	try {
		await cleanupTestWorkspace();

		// テンポラリディレクトリを作成（プロセスIDとタイムスタンプを含めて一意にする）
		const uniqueId = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
		const tmpDir = path.join(os.tmpdir(), `vscode-test-${uniqueId}`);

		// mockWorkspaceをテンポラリディレクトリにコピー
		const mockWorkspacePath = path.resolve(
			__dirname,
			'../fixtures/mockWorkspace',
		);
		tmpWorkspacePath = path.join(tmpDir, 'mockWorkspace');

		// mockWorkspaceディレクトリを作成
		fs.mkdirSync(tmpWorkspacePath, { recursive: true });

		// mockWorkspaceの内容をコピー
		if (!fs.existsSync(mockWorkspacePath)) {
			throw new Error(`Mock workspace not found at: ${mockWorkspacePath}`);
		}

		const files = fs.readdirSync(mockWorkspacePath);
		for (const file of files) {
			const srcPath = path.join(mockWorkspacePath, file);
			const destPath = path.join(tmpWorkspacePath, file);
			fs.copyFileSync(srcPath, destPath);
		}

		// 新しいワークスペースを追加
		const added = await vscode.workspace.updateWorkspaceFolders(0, 0, {
			uri: vscode.Uri.file(tmpWorkspacePath),
			name: `Test Workspace ${uniqueId}`,
		});

		if (!added) {
			throw new Error(
				`Failed to add workspace folder: ${tmpWorkspacePath}\nCurrent workspace folders: ${JSON.stringify(vscode.workspace.workspaceFolders)}`,
			);
		}

		// ワークスペースが正しく設定されるのを待つ時間を増やす
		await new Promise((resolve) => setTimeout(resolve, 10000));

		// ワークスペースが正しく設定されたことを確認
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || workspaceFolders.length === 0) {
			throw new Error(
				`Workspace folder was not created after waiting.\nExpected workspace at: ${tmpWorkspacePath}\nCurrent workspace state: ${JSON.stringify(vscode.workspace.workspaceFolders)}`,
			);
		}

		const workspaceFolder = workspaceFolders[0];
		if (!fs.existsSync(workspaceFolder.uri.fsPath)) {
			throw new Error(
				`Workspace folder does not exist at: ${workspaceFolder.uri.fsPath}\nExpected workspace at: ${tmpWorkspacePath}`,
			);
		}

		// ワークスペースの状態をログに出力
		console.log('Current workspace state:', {
			path: workspaceFolder.uri.fsPath,
			name: workspaceFolder.name,
			index: workspaceFolder.index,
			exists: fs.existsSync(workspaceFolder.uri.fsPath),
		});
	} catch (error) {
		console.error('Failed to create test workspace:', error);
		if (tmpWorkspacePath && fs.existsSync(tmpWorkspacePath)) {
			try {
				fs.rmSync(tmpWorkspacePath, { recursive: true, force: true });
			} catch (cleanupError) {
				console.error('Failed to cleanup temporary workspace:', cleanupError);
			}
		}
		throw error;
	}
}

export async function cleanupTestWorkspace(): Promise<void> {
	try {
		// 開いているエディタをすべて閉じる
		await vscode.commands.executeCommand('workbench.action.closeAllEditors');

		// ワークスペースをクリア
		if (vscode.workspace.workspaceFolders?.length) {
			await vscode.workspace.updateWorkspaceFolders(
				0,
				vscode.workspace.workspaceFolders.length,
			);
		}

		// クリーンアップが完了するのを待つ
		await new Promise((resolve) => setTimeout(resolve, 3000));
	} catch (error) {
		console.error('Failed to cleanup workspace:', error);
		throw error; // エラーを再スローして、テストを確実に失敗させる
	}
}

export function createMockTextDocument(
	fileName: string,
	content: string,
): vscode.TextDocument {
	return {
		fileName,
		getText: () => content,
		uri: vscode.Uri.file(fileName),
		languageId: path.extname(fileName).slice(1),
		version: 1,
		isDirty: false,
		isUntitled: false,
		lineCount: content.split('\n').length,
		// 他の必要なプロパティも追加
	} as vscode.TextDocument;
}
