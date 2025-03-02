import * as assert from 'node:assert'
import { Uri } from 'vscode'
import {
  modifiedScheme,
  toFileUri,
  toOpenedFileUri,
} from '../../../src/utils/uriUtils'

suite('UriUtils Test Suite', () => {
  const testUri = Uri.file('/test/path/file.txt')

  test('toFileUri should convert any URI to file scheme', () => {
    const customUri = Uri.from({
      scheme: 'custom',
      path: testUri.path,
      authority: testUri.authority,
      query: testUri.query,
      fragment: testUri.fragment,
    })

    const result = toFileUri(customUri)

    assert.strictEqual(result.scheme, 'file')
    assert.strictEqual(result.path, testUri.path)
    assert.strictEqual(result.authority, testUri.authority)
    assert.strictEqual(result.query, testUri.query)
    assert.strictEqual(result.fragment, testUri.fragment)
  })

  test('toOpenedFileUri should convert any URI to opened-file scheme', () => {
    const result = toOpenedFileUri(testUri)

    assert.strictEqual(result.scheme, 'opened-file')
    assert.strictEqual(result.path, testUri.path)
    assert.strictEqual(result.authority, testUri.authority)
    assert.strictEqual(result.query, testUri.query)
    assert.strictEqual(result.fragment, testUri.fragment)
  })

  test('modifiedScheme should modify URI scheme while preserving other properties', () => {
    const customScheme = 'custom-scheme'
    const result = modifiedScheme(testUri, customScheme)

    assert.strictEqual(result.scheme, customScheme)
    assert.strictEqual(result.path, testUri.path)
    assert.strictEqual(result.authority, testUri.authority)
    assert.strictEqual(result.query, testUri.query)
    assert.strictEqual(result.fragment, testUri.fragment)
  })

  test('URI transformations should be immutable', () => {
    const originalUri = Uri.file('/test/path/file.txt')
    const transformedUri = toOpenedFileUri(originalUri)

    assert.strictEqual(originalUri.scheme, 'file')
    assert.notStrictEqual(originalUri.scheme, transformedUri.scheme)
  })

  test('URI transformations should handle empty properties', () => {
    const minimalUri = Uri.from({
      scheme: 'file',
      path: '/test/path/file.txt',
    })

    const result = toOpenedFileUri(minimalUri)

    assert.strictEqual(result.scheme, 'opened-file')
    assert.strictEqual(result.path, minimalUri.path)
    assert.strictEqual(result.authority, '')
    assert.strictEqual(result.query, '')
    assert.strictEqual(result.fragment, '')
  })
})
