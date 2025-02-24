import * as vscode from 'vscode';

function getAllTabs(): vscode.Tab[] {
    return vscode.window.tabGroups.all
        .flatMap(group => group.tabs);
}

export function findTab(uri: vscode.Uri): vscode.Tab | undefined {
    return getAllTabs()
        .find(tab =>
            tab.input instanceof vscode.TabInputText &&
            tab.input.uri.fsPath === uri.fsPath
        );
} 

export function getWorkspaceOpenEditorTabs(workspaceRoot: string): vscode.Tab[] {
    return getAllTabs()
        .filter(tab => 
            tab.input instanceof vscode.TabInputText &&
            tab.input.uri.fsPath.startsWith(workspaceRoot)
        );
}

