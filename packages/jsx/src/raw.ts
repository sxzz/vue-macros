import jsxDirective from '@vue-macros/jsx-directive/raw'
import jsxMacros from '@vue-macros/jsx-macros/raw'

import { resolveJSXOptions, type JSXOptions } from './core/options'
import type { UnpluginFactory } from 'unplugin'

const jsxPlugins = [
  ['directive', jsxDirective],
  ['macros', jsxMacros],
] as const

const plugin: UnpluginFactory<JSXOptions | undefined, true> = (
  userOptions = {},
  meta,
) => {
  const options = resolveJSXOptions(userOptions)
  return jsxPlugins.flatMap(([name, plugin]) =>
    options[name] ? plugin(options[name], meta) : [],
  )
}

export default plugin
