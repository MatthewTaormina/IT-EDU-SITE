import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'IT Learning Hub',
  tagline: 'From foundations to full-stack — structured courses for every level.',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // Update this when you have a domain
  url: 'https://your-domain.com',
  baseUrl: '/',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // .md files parsed as CommonMark; .mdx files parsed as MDX with JSX.
  // Prevents HTML comment errors in plain .md content files.
  markdown: {
    format: 'detect',
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Serve Assets/ folder (images, diagrams) alongside the site
  staticDirectories: ['static', '../Assets'],

  presets: [
    [
      'classic',
      {
        docs: {
          // Point directly at the Content/ folder — no duplication
          path: '../Content',
          routeBasePath: 'courses',
          sidebarPath: './sidebars.ts',
          editUrl: undefined,
          showLastUpdateTime: false,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'IT Learning Hub',
      logo: {
        alt: 'IT Learning Hub Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: '/courses',
          label: 'Content Hub',
          position: 'left',
        },
        {
          type: 'docSidebar',
          sidebarId: 'coursesSidebar',
          position: 'left',
          label: 'Courses',
        },
        {
          type: 'docSidebar',
          sidebarId: 'articlesSidebar',
          position: 'left',
          label: 'Articles',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Courses',
          items: [
            {
              label: 'Web Development',
              to: '/courses/Courses/webdev/',
            },
          ],
        },
        {
          title: 'Articles',
          items: [
            {
              label: 'Internet vs Web',
              to: '/courses/Articles/internet_vs_web',
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} IT Learning Hub. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'yaml', 'typescript', 'python'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
