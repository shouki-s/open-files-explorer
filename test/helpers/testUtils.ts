import * as vscode from 'vscode'

export async function createTestEditor(
  content: string,
  language?: string,
): Promise<vscode.TextEditor> {
  const document = await vscode.workspace.openTextDocument({
    content,
    language,
  })
  return await vscode.window.showTextDocument(document)
}
