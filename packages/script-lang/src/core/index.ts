import {
  type CodeTransform,
  MagicString,
  generateTransform,
  parseSFC,
} from '@vue-macros/common'
import type { OptionsResolved } from '..'

export function transformScriptLang(
  code: string,
  id: string,
  options: OptionsResolved,
): CodeTransform | undefined {
  const s = new MagicString(code)
  const lang = ` lang="${options?.default || 'ts'}">`

  const {
    sfc: {
      descriptor: { script, scriptSetup },
    },
  } = parseSFC(code, id)

  if (script && !script.attrs.lang) {
    const start = script.loc.start.offset
    s.overwrite(start - 1, start, lang)
  }
  if (scriptSetup && !scriptSetup.attrs.lang) {
    const start = scriptSetup.loc.start.offset
    s.overwrite(start - 1, start, lang)
  }

  return generateTransform(s, id)
}
