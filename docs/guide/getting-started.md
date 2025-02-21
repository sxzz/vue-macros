<script setup>
import { version } from 'vue-tsc/package.json'
</script>

# Getting Started

Vue Macros is a library that implements unofficial proposals and ideas for Vue,
exploring and extending its features and syntax.

We assume you are already familiar with the basic usages of Vue before you continue.

## Requirements

- Node.js `>= v16.14.0`.
- Vue `>= v2.7` or Vue `>= v3.0`.
  - Some features need Vue `>= v3.2.25`.
- VSCode extension [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) and `vue-tsc` are <code>v{{ version }}</code>
  - Vue Macros will continue to adapt to the latest version as soon as possible, older versions may not be supported.

::: warning
WebStorm is not supported.
:::

## Creating a Vue Macros Project

### Installation

::: code-group

```bash [npm]
npm i -g @vue-macros/cli
```

```bash [yarn]
yarn global add @vue-macros/cli
```

```bash [pnpm]
pnpm add -g @vue-macros/cli
```

:::

This command will install [@vue-macros/cli](https://github.com/vue-macros/vue-macros-cli), the official Vue Macros scaffolding tool.

### Initialization

::: code-group

```bash [npm]
npm create vite@latest my-vue-macros -- --template vue-ts
cd my-vue-macros
vue-macros init
```

```bash [yarn]
yarn create vite my-vue-macros --template vue-ts
cd my-vue-macros
vue-macros init
```

```bash [pnpm]
pnpm create vite my-vue-macros --template vue-ts
cd my-vue-macros
vue-macros init
```

You will be presented with prompts for several optional experimental features.

:::

## Templates

- [Vite + Vue 3](https://github.com/vue-macros/vite)
- [Vite + Vue 2](https://github.com/vue-macros/vue-macros/tree/main/playground/vue2)
- [Nuxt 3 + Vue 3](https://github.com/vue-macros/nuxt)
- [Rsbuild + Vue 3](https://github.com/vue-macros/vue3-rsbuild)
- [Vue CLI + Vue 2](https://github.com/vue-macros/vue2-vue-cli)
- [Rspack + Vue 2](https://github.com/vue-macros/vue2-rspack)

🌟 More templates are welcome!

## Nuxt Integration

If you're using [Nuxt 3](https://nuxt.com/), read the [Nuxt Integration](./nuxt-integration.md).

## Bundler Integrations

If you're using [Vite](https://vitejs.dev/), [Rollup](https://rollupjs.org/), [esbuild](https://esbuild.github.io/), [Webpack](https://webpack.js.org/), or [Rspack](https://www.rspack.dev/), read the [Bundler Integration](./bundler-integration.md).
