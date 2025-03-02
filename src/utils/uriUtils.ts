import { Uri } from 'vscode';

export function toFileUri(uri: Uri): Uri {
	return modifiedScheme(uri, 'file');
}

export function toOpenedFileUri(uri: Uri): Uri {
	return modifiedScheme(uri, 'opened-file');
}

export function modifiedScheme(uri: Uri, scheme: string): Uri {
	return Uri.from({
		...uri,
		scheme,
	});
}
