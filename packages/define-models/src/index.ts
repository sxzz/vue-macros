import { type UnpluginContextMeta, createUnplugin } from 'unplugin'
import {
  type BaseOptions,
  FilterFileType,
  type MarkRequired,
  createFilter,
  detectVueVersion,
  getFilterPattern,
  normalizePath,
} from '@vue-macros/common'
import { generatePluginName } from '#macros' with { type: 'macro' }
import { transformDefineModels } from './core'
import {
  emitHelperCode,
  emitHelperId,
  helperPrefix,
  useVmodelHelperCode,
  useVmodelHelperId,
} from './core/helper'

export interface Options extends BaseOptions {
  /**
   * Unified mode, only works for Vue 2
   *
   * Converts `modelValue` to `value`
   */
  unified?: boolean
}

export type OptionsResolved = MarkRequired<
  Options,
  'include' | 'version' | 'unified'
>

function resolveOptions(
  options: Options,
  framework: UnpluginContextMeta['framework'],
): OptionsResolved {
  const version = options.version || detectVueVersion()
  const include = getFilterPattern(
    [FilterFileType.VUE_SFC_WITH_SETUP, FilterFileType.SETUP_SFC],
    framework,
  )
  return {
    include,
    unified: true,
    ...options,
    version,
  }
}

const name = generatePluginName()

export default createUnplugin<Options | undefined, false>(
  (userOptions = {}, { framework }) => {
    const options = resolveOptions(userOptions, framework)
    const filter = createFilter(options)

    return {
      name,
      enforce: 'pre',

      resolveId(id) {
        if (normalizePath(id).startsWith(helperPrefix)) return id
      },

      loadInclude(id) {
        return normalizePath(id).startsWith(helperPrefix)
      },

      load(_id) {
        const id = normalizePath(_id)
        if (id === emitHelperId) return emitHelperCode
        else if (id === useVmodelHelperId) return useVmodelHelperCode
      },

      transformInclude: filter,
      transform(code, id) {
        return transformDefineModels(code, id, options.version, options.unified)
      },
    }
  },
)
