import jsxDirective from '@vue-macros/jsx-directive'
import jsxMacros from '@vue-macros/jsx-macros'

import { generatePluginName } from '#macros' with { type: 'macro' }
import {
  createCombinePlugin,
  type UnpluginCombineInstance,
} from 'unplugin-combine'
import { resolveJSXOptions, type JSXOptions } from './core/options'

const jsxPlugins = [
  ['directive', jsxDirective],
  ['macros', jsxMacros],
] as const

const name = generatePluginName()
const plugin: UnpluginCombineInstance<JSXOptions | undefined> =
  createCombinePlugin<JSXOptions | undefined>((userOptions = {}, meta) => {
    const options = resolveJSXOptions(userOptions)
    const plugins = jsxPlugins.flatMap(([name, plugin]) =>
      options[name] ? plugin[meta.framework!](options[name]) : [],
    )

    return {
      name,
      plugins,
    }
  })

export default plugin
