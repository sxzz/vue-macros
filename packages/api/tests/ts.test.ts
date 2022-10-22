import { babelParse } from '@vue-macros/common'
import { describe, expect, test } from 'vitest'
import { resolveTSProperties, resolveTSReferencedType } from '../src/ts'
import { hideAstLocation } from './_util'
import type {
  TSInterfaceDeclaration,
  TSTypeAliasDeclaration,
} from '@babel/types'

describe('ts', () => {
  test('resolveTSProperties', () => {
    const stmts = babelParse(
      `type Alias = string
interface Foo {
  foo: string | number
  ['bar']: Alias
  new (): Foo
  new (param: string): Foo

  todo(): void
  todo(param: string): string

  hello(): void
  hello(param: string): string

  // ignore
  hello: string

  // unsupported
  [key: string]: any
}`,
      'ts'
    ).body
    const node = stmts[1] as TSInterfaceDeclaration
    const result = resolveTSProperties(node.body)

    expect(hideAstLocation(result)).toMatchInlineSnapshot(`
      {
        "callSignatures": [],
        "constructSignatures": [
          "TSConstructSignatureDeclaration...",
          "TSConstructSignatureDeclaration...",
        ],
        "methods": {
          "hello": [
            "TSMethodSignature...",
            "TSMethodSignature...",
          ],
          "todo": [
            "TSMethodSignature...",
            "TSMethodSignature...",
          ],
        },
        "properties": {
          "bar": {
            "optional": false,
            "signature": "TSPropertySignature...",
            "value": "TSTypeReference...",
          },
          "foo": {
            "optional": false,
            "signature": "TSPropertySignature...",
            "value": "TSUnionType...",
          },
        },
      }
    `)
  })

  test('resolveTSProperties', () => {
    const stmts = babelParse(
      `export type AliasString1 = string
type AliasString2 = AliasString1
type Foo = AliasString`,
      'ts'
    ).body
    const node = stmts[1] as TSTypeAliasDeclaration
    const result = resolveTSReferencedType(stmts, node.typeAnnotation)!
    expect(result.type).toBe('TSStringKeyword')
  })
})
