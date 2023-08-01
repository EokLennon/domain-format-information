import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  name: 'Domain Format information',
  description: "Display the Card's information for Domain Format.",
  version: '1.0.0',
  manifest_version: 3,
  icons: {
    '16': 'img/icon-16.png',
    '32': 'img/icon-32.png',
    '48': 'img/icon-48.png',
    '128': 'img/icon-128.png',
  },
  // action: {
  //   default_popup: 'popup.html',
  //   default_icon: 'img/icon-48.png',
  // },
  // options_page: 'options.html',
  // background: {
  //   service_worker: 'src/background/index.ts',
  //   type: 'module',
  // },
  content_scripts: [
    {
      matches: ['https://ygoprodeck.com/card/*'],
      js: ['src/content/index.ts'],
    },
  ],
  web_accessible_resources: [
    {
      resources: ['img/icon-16.png', 'img/icon-32.png', 'img/icon-48.png', 'img/icon-128.png'],
      matches: [],
    },
  ],
  // permissions: [],
})
