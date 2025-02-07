import { testFixtures } from '@vue-macros/test-utils'
import { describe } from 'vitest'
import { transformJsxDirective } from '../src/api'

describe('jsx-vue-directive', () => {
  describe('vue 3 v-html', async () => {
    await testFixtures(
      import.meta.glob<string>('./fixtures/v-html/*.{vue,jsx,tsx}', {
        eager: true,
        query: '?raw',
        import: 'default',
      }),
      (_, id, code) =>
        transformJsxDirective(code, id, {
          version: 3,
          lib: 'vue',
          prefix: 'v-',
        })?.code,
    )
  })

  describe('vue 2.7 v-html', async () => {
    await testFixtures(
      import.meta.glob<string>('./fixtures/v-html/*.{vue,jsx,tsx}', {
        eager: true,
        query: '?raw',
        import: 'default',
      }),
      (_, id, code) =>
        transformJsxDirective(code, id, {
          version: 2.7,
          lib: 'vue',
          prefix: 'v-',
        })?.code,
    )
  })
})
