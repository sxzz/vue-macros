import { resolve } from 'node:path'
import { rollupBuild, RollupVueJsx, testFixtures } from '@vue-macros/test-utils'
import { describe } from 'vitest'
import VueJsxMacros from '../src/rollup'

describe('fixtures', async () => {
  await testFixtures(
    ['tests/fixtures/**/*'],
    (_, id) => {
      return rollupBuild(id, [VueJsxMacros(), RollupVueJsx()])
    },
    {
      cwd: resolve(__dirname, '..'),
      promise: true,
    },
  )
})
