import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'IT Learning Hub',
  tagline: 'From foundations to full-stack — structured courses for every level.',
  favicon: 'img/favicon.svg',

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
          label: 'Hub',
          position: 'left',
        },
        {
          to: '/courses/Pathways',
          label: 'Pathways',
          position: 'left',
        },
        {
          to: '/courses/Courses',
          label: 'Courses',
          position: 'left',
        },
        {
          to: '/courses/Projects',
          label: 'Projects',
          position: 'left',
        },
        {
          to: '/courses/Articles',
          label: 'Articles',
          position: 'left',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Explore',
          items: [
            { label: 'Pathways', to: '/courses/Pathways' },
            { label: 'Courses', to: '/courses/Courses' },
            { label: 'Projects', to: '/courses/Projects' },
            { label: 'Articles', to: '/courses/Articles' },
          ],
        },
        {
          title: 'Courses',
          items: [
            { label: 'Web Development', to: '/courses/Courses/webdev/' },
          ],
        },
        {
          title: 'Pathways',
          items: [
            {
              label: 'Web Developer: Zero to Employable',
              to: '/courses/Pathways/webdev_beginner/',
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
