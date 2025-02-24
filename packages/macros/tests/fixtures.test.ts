import { resolve } from 'node:path'
import {
  rollupBuild,
  RollupVue,
  RollupVueJsx,
  testFixtures,
  UnpluginOxc,
} from '@vue-macros/test-utils'
import { describe } from 'vitest'
import VueMacros from '../src/rollup'

describe('fixtures', async () => {
  await testFixtures(
    ['tests/fixtures/**/*.{vue,js,jsx,ts,tsx}', '!tests/fixtures/types.ts'],
    (args, id) => {
      const version = id.includes('vue2') ? 2 : 3
      return rollupBuild(id, [
        VueMacros({
          setupSFC: true,
          version,
          plugins: {
            vue: RollupVue({
              include: [/\.vue$/, /\.setup\.[cm]?[jt]sx?/],
            }),
            vueJsx: RollupVueJsx(),
          },
        }),
        UnpluginOxc.rollup(),
      ])
    },
    {
      cwd: resolve(__dirname, '..'),
      promise: true,
    },
  )
})
