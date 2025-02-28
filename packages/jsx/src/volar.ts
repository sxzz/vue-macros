import jsxDirective from '@vue-macros/volar/jsx-directive'
import jsxMacros from '@vue-macros/volar/jsx-macros'
import jsxRef from '@vue-macros/volar/jsx-ref'
import { createPlugin, type PluginReturn } from 'ts-macro'
import { resolveJSXOptions, type JSXOptions } from './core/options'

const jsxPlugins = [
  ['directive', jsxDirective],
  ['macros', jsxMacros],
  ['ref', jsxRef],
] as const

const plugin: PluginReturn<JSXOptions | undefined> = createPlugin(
  (ctx, userOptions) => {
    const options = resolveJSXOptions(userOptions)
    return jsxPlugins.flatMap(([name, plugin]) =>
      options[name] ? plugin(options[name])(ctx) : [],
    )
  },
)

export default plugin
