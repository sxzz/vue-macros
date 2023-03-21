import { defineConfig } from 'tsup'
import cfg from '../../tsup.config.js'

export default defineConfig({
  ...cfg,
  format: ['esm'],
})
