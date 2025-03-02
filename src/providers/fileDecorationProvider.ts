import * as vscode from 'vscode';
import { findTab } from '../utils/tabUtils';
import { toFileUri } from '../utils/uriUtils';

export class FileDecorationProvider implements vscode.FileDecorationProvider {
	private readonly _onDidChangeFileDecorations: vscode.EventEmitter<
		vscode.Uri | vscode.Uri[]
	> = new vscode.EventEmitter<vscode.Uri | vscode.Uri[]>();
	readonly onDidChangeFileDecorations: vscode.Event<vscode.Uri | vscode.Uri[]> =
		this._onDidChangeFileDecorations.event;

	provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration | undefined {
		if (uri.scheme !== 'opened-file') {
			return undefined;
		}

		const fileUri = toFileUri(uri);
		const tab = findTab(fileUri);
		if (!tab) {
			return undefined;
		}

		if (tab.isPinned) {
			return {
				badge: 'P',
				tooltip: 'ピン留め',
			};
		}

		if (tab.isDirty) {
			return {
				badge: 'M',
				tooltip: '変更済み',
			};
		}

		return undefined;
	}

	updateDecorations(uris: vscode.Uri[]): void {
		this._onDidChangeFileDecorations.fire(uris);
	}
}
