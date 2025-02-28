import type { FilterOptions } from '@vue-macros/common'
import type { Options as OptionsJsxDirective } from '@vue-macros/jsx-directive'
import type { Options as OptionsJsxMacros } from '@vue-macros/jsx-macros'

export type JSXOptions = {
  lib?: 'vue' | 'vue/vapor' | 'react' | 'preact' | 'solid' | (string & {})
  ref?: ResolvedJSXOptions['ref'] | boolean
  macros?: ResolvedJSXOptions['macros'] | boolean
  directive?: ResolvedJSXOptions['directive'] | boolean
}

export type ResolvedJSXOptions = {
  ref?: FilterOptions & { alias?: string[] }
  macros?: OptionsJsxMacros
  directive?: OptionsJsxDirective
}

export function resolveJSXOptions(
  options: JSXOptions = {},
): ResolvedJSXOptions {
  const resolveOptions: ResolvedJSXOptions = {}
  if (options.directive !== false)
    resolveOptions.directive =
      options.directive === true ? {} : (options.directive ?? {})
  if (options.macros !== false)
    resolveOptions.macros =
      options.macros === true ? {} : (options.macros ?? {})
  if (options.ref !== false)
    resolveOptions.ref = options.ref === true ? {} : (options.ref ?? {})

  if (options.lib) {
    resolveOptions.directive && (resolveOptions.directive.lib ??= options.lib)
    resolveOptions.macros && (resolveOptions.macros.lib ??= options.lib)
  }
  return resolveOptions
}
