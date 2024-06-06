import type {
  ConstantTypes,
  NodeTransform,
  NodeTypes,
} from '@vue/compiler-core'

export interface Options {
  /**
   * @default '!'
   */
  negativePrefix?: string
}

export function transformBooleanProp({
  negativePrefix = '!',
  constType = 3 satisfies ConstantTypes.CAN_STRINGIFY,
}: Options & { constType?: ConstantTypes } = {}): NodeTransform {
  return (node) => {
    if (node.type !== (1 satisfies NodeTypes.ELEMENT)) return
    for (const [i, prop] of node.props.entries()) {
      if (
        prop.type !== (6 satisfies NodeTypes.ATTRIBUTE) ||
        prop.value !== undefined
      )
        continue

      const isNegative = prop.name[0] === negativePrefix
      const propName = isNegative ? prop.name.slice(1) : prop.name
      const valueName = String(!isNegative)
      if (isNegative) prop.loc.start.offset++
      node.props[i] = {
        type: 7 satisfies NodeTypes.DIRECTIVE,
        name: 'bind',
        arg: {
          type: 4 satisfies NodeTypes.SIMPLE_EXPRESSION,
          constType: 3 satisfies ConstantTypes.CAN_STRINGIFY,
          content: propName,
          isStatic: true,
          loc: prop.loc,
        },
        exp: {
          type: 4 satisfies NodeTypes.SIMPLE_EXPRESSION,
          constType,
          content: valueName,
          isStatic: false,
          loc: {
            start: {
              ...prop.loc.start,
              offset: prop.loc.start.offset + 1,
            },
            end: prop.loc.end,
            source: valueName,
          },
        },
        loc: prop.loc,
        modifiers: [],
      }
    }
  }
}
