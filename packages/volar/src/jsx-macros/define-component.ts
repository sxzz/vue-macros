import { replaceSourceRange } from 'muggle-string'
import { allCodeFeatures } from 'ts-macro'
import { getStart, getText } from '../common'
import type { TransformOptions } from '.'

export function transformDefineComponent(
  node: import('typescript').CallExpression,
  options: TransformOptions,
): void {
  const { codes, source } = options

  replaceSourceRange(codes, source, node.arguments[0].end, node.end - 1)

  const componentOptions = node.arguments[1]
  replaceSourceRange(
    codes,
    source,
    getStart(node, options),
    node.expression.end + 1,
    '(',
    [
      getText(node.expression, options),
      source,
      getStart(node, options),
      allCodeFeatures,
    ],
    '(() => ({}) as any, ',
    componentOptions
      ? [
          getText(componentOptions, options),
          source,
          getStart(componentOptions, options),
          allCodeFeatures,
        ]
      : '',
    '), ',
  )
}
