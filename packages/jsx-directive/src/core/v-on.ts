import { HELPER_PREFIX, type MagicString } from '@vue-macros/common'
import type { JsxDirectiveNode } from '.'

export function transformVOn(
  nodes: JsxDirectiveNode[],
  s: MagicString,
  offset: number,
) {
  if (nodes.length > 0)
    s.prependRight(
      offset,
      `const ${HELPER_PREFIX}transformVOn = (obj) => Object.entries(obj).reduce((res, [key, value]) => (res['on' + key[0].toUpperCase() + key.slice(1)] = value, res), {})`,
    )

  nodes.forEach(({ attribute }) => {
    s.overwriteNode(
      attribute,
      `{...${HELPER_PREFIX}transformVOn(${s.slice(
        attribute.value!.start! + offset + 1,
        attribute.value!.end! + offset - 1,
      )})}`,
      { offset },
    )
  })
}
