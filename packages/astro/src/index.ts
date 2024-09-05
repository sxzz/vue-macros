import { resolveOptions, type Options } from 'unplugin-vue-macros'
import VueMacros from 'unplugin-vue-macros/vite'
import type { AstroIntegration, ViteUserConfig } from 'astro'
import type { Plugin, PluginOption } from 'vite'

function findPluginAndRemove(
  name: string,
  plugins: ViteUserConfig['plugins'],
): Plugin | undefined {
  const idx = plugins!.findIndex(
    (plugin) => plugin && 'name' in plugin && plugin.name === name,
  )
  if (idx === -1) return
  const plugin = plugins![idx]
  plugins!.splice(idx, 1)
  return plugin as any
}

export default function (options?: Options): AstroIntegration {
  return {
    name: '@vue-macros/astro',
    hooks: {
      'astro:config:setup': ({ config }) => {
        const resolvedOptions = resolveOptions(options || {})
        const vue = findPluginAndRemove('vite:vue', config.vite.plugins)
        const vueJsx = findPluginAndRemove('vite:vue-jsx', config.vite.plugins)

        config.vite.plugins?.push(
          VueMacros({
            ...resolvedOptions,
            plugins: {
              vue,
              vueJsx,
            },
          }) as PluginOption,
        )
      },
    },
  }
}
