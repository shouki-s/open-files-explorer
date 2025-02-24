import * as vscode from 'vscode';

export function getTextEditorTabs(): vscode.Tab[] {
    return vscode.window.tabGroups.all
        .flatMap(group => group.tabs)
        .filter(tab => tab.input instanceof vscode.TabInputText);
}

export function findTab(uri: vscode.Uri): vscode.Tab | undefined {
    return getTextEditorTabs()
        .find(tab => 
            (tab.input as vscode.TabInputText).uri.fsPath === uri.fsPath
        );
} 