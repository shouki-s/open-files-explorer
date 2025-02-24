import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
	try {
		// テストを実行するワークスペースのパス
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');
		const extensionTestsPath = path.resolve(__dirname, './suite/index');

		// テストを実行
		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath,
		});
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main(); 