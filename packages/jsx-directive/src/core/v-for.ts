import {
  HELPER_PREFIX,
  importHelperFn,
  type MagicStringAST,
} from '@vue-macros/common'
import type { OptionsResolved } from '..'
import { transformRestructure } from './restructure'
import { isVue2, type JsxDirective } from '.'

export function resolveVFor(
  attribute: JsxDirective['attribute'],
  node: JsxDirective['node'],
  s: MagicStringAST,
  { lib, version }: OptionsResolved,
  vMemoAttribute?: JsxDirective['attribute'],
): string {
  if (attribute.value) {
    let item, index, objectIndex, list
    if (
      attribute.value.type === 'JSXExpressionContainer' &&
      attribute.value.expression.type === 'BinaryExpression'
    ) {
      if (attribute.value.expression.left.type === 'SequenceExpression') {
        const expressions = attribute.value.expression.left.expressions
        item = expressions[0] ? s.sliceNode(expressions[0]) : ''
        index = expressions[1] ? s.sliceNode(expressions[1]) : ''
        objectIndex = expressions[2] ? s.sliceNode(expressions[2]) : ''
      } else {
        item = s.sliceNode(attribute.value.expression.left)
      }

      list = s.sliceNode(attribute.value.expression.right)
    }

    if (item && list) {
      if (vMemoAttribute) {
        index ??= `${HELPER_PREFIX}index`
      }

      if (lib === 'vapor') {
        const params = `([${item}${
          index ? `, ${index}` : ''
        }${objectIndex ? `, ${objectIndex}` : ''}])`
        const key = node.openingElement.attributes.find(
          (i) => i.type === 'JSXAttribute' && i.name.name === 'key',
        )
        if (
          key?.type === 'JSXAttribute' &&
          key.value?.type === 'JSXExpressionContainer' &&
          key.value.expression
        ) {
          s.prependRight(
            node.end!,
            `, ${params} => (${s.sliceNode(key.value.expression)})`,
          )
          s.remove(key.start! - 1, key.end!)
        }
        s.appendRight(node.start!, `${params} => `)
        return `${importHelperFn(s, 0, 'createFor', 'vue')}(() => ${list}, `
      } else {
        const params = `(${item}${
          index ? `, ${index}` : ''
        }${objectIndex ? `, ${objectIndex}` : ''})`
        const renderList = isVue2(version)
          ? 'Array.from'
          : importHelperFn(
              s,
              0,
              'renderList',
              lib.startsWith('vue')
                ? 'vue'
                : '@vue-macros/jsx-directive/helpers',
            )
        return `${renderList}(${list}, ${params} => `
      }
    }
  }

  return ''
}

export function transformVFor(
  nodes: JsxDirective[],
  s: MagicStringAST,
  options: OptionsResolved,
): void {
  if (nodes.length === 0) return

  nodes.forEach(({ node, attribute, parent, vIfAttribute, vMemoAttribute }) => {
    const hasScope = ['JSXElement', 'JSXFragment'].includes(
      String(parent?.type),
    )
    s.prependRight(
      node.end!,
      `)${hasScope ? (vIfAttribute ? '' : '}') : '}</>'}`,
    )
    s.appendLeft(
      node.start!,
      `${hasScope ? (vIfAttribute ? '' : '{') : '<>{'}${resolveVFor(attribute, node, s, options, vMemoAttribute)}`,
    )
    s.remove(attribute.start! - 1, attribute.end!)

    if (options.lib === 'vapor') {
      s.overwriteNode(
        node,
        transformRestructure(s.sliceNode(node), { unwrapRef: true }),
      )
    }

    const isTemplate =
      node.type === 'JSXElement' &&
      node.openingElement.name.type === 'JSXIdentifier' &&
      node.openingElement.name.name === 'template'
    if (isTemplate && node.closingElement) {
      const content = isVue2(options.version) ? 'span' : ''
      s.overwriteNode(node.openingElement.name, content)
      s.overwriteNode(node.closingElement.name, content)
    }
  })
}
