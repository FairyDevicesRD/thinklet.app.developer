// @ts-check
import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'THINKLET App Developer',
  tagline: 'Get started with THINKLET',
  favicon: 'img/favicon.ico',

  url: 'https://FairyDevicesRD.github.io',
  baseUrl: '/thinklet.app.developer/',

  organizationName: 'FairyDevicesRD', // Usually your GitHub org/user name.
  projectName: 'thinklet.app.developer', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja'],
  },

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js'
        },
        blog: {
          showReadingTime: true,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/thinklet-card.png',
      navbar: {
        title: 'Home',
        logo: {
          alt: 'Home Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Tutorial',
          },
          {
            href: 'https://zenn.dev/p/fairydevices',
            label: 'Zenn',
            position: 'right',
          },
          {
            href: 'https://github.com/FairyDevicesRD/thinklet.app.sdk',
            label: 'App SDK',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/intro',
              },
              {
                label: 'Operator Manual LC-01',
                href: 'https://static-connected-worker.thinklet.fd.ai/support/ja/',
              },
              {
                label: 'Software Licenses',
                href: 'https://oss-license.developer.thinklet.fd.ai/',
              },
            ],
          },
          {
            title: 'SDK',
            items: [
              {
                label: 'App SDK',
                href: 'https://github.com/FairyDevicesRD/thinklet.app.sdk',
              },
            ],
          },
          {
            title: 'Link',
            items: [
              {
                label: 'FairyDevices',
                href: 'https://fairydevices.jp',
              },
              {
                href: 'https://zenn.dev/p/fairydevices',
                label: 'Zenn',
                position: 'right',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/FairyDevicesRD',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Fairy Devices Inc. All rights reserved.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

module.exports = config;
