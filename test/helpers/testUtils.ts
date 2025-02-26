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
