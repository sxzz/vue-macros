import { defineConfig } from 'vitepress'
import { sidebars } from './data'
import type { DefaultTheme } from 'vitepress'

export default defineConfig({
  title: 'unplugin-vue-macros',
  description: 'Explore and extend more macros and syntax sugar to Vue.',
  lastUpdated: true,
  markdown: {
    theme: 'material-palenight',
    lineNumbers: true,
  },
  themeConfig: {
    // logo: '/logo.png',
    footer: {
      copyright: 'MIT License © 2022 三咲智子',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/sxzz/unplugin-vue-macros' },
    ],
    editLink: {
      pattern: 'https://github.com/sxzz/unplugin-vue-macros/docs/docs/:path',
      text: 'Edit this page on GitHub',
    },
    nav: getNavs(),
    sidebar: getSidebar(),
  },
})

function getSidebar() {
  return sidebars
}

function getNavs() {
  const navs: DefaultTheme.NavItem[] = []
  Object.keys(sidebars).forEach((key) => {
    const item = sidebars[key][0]
    navs.push({
      text: item.text,
      items: item.items,
    })
  })
  return navs
}
