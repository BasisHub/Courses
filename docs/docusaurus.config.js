// @ts-check
const codeTheme = require('./src/theme/prism-dwc-theme');
const books = require('./src/data/books');
const bookIconsCss = require('./src/data/book-icons-css');

const baseUrl = '/Courses/';

/** @type {import('@docusaurus/types').Config} */
module.exports = {
  title: 'BASIS Courses',
  tagline: 'Training books for BBj and DWC developers.',
  favicon: 'img/favicon.svg',
  url: 'https://basishub.github.io',
  baseUrl,
  organizationName: 'BasisHub',
  projectName: 'Courses',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  i18n: {defaultLocale: 'en', locales: ['en']},
  // Docusaurus does not prefix baseUrl on scripts/stylesheets, so use the constant.
  scripts: [
    {src: `${baseUrl}js/dwc-theme-switcher.js`, async: false},
    {src: `${baseUrl}js/link-decorator.js`},
  ],
  stylesheets: [`${baseUrl}css/dwc-ui.css`],
  headTags: [
    {
      tagName: 'style',
      attributes: {id: 'book-icons'},
      innerHTML: bookIconsCss(),
    },
  ],
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
      onBrokenMarkdownImages: 'throw',
    },
  },
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: 'docs',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/BasisHub/Courses/tree/main/docs/',
        },
        blog: false,
        theme: {
          customCss: [
            require.resolve('@fontsource-variable/inter/wght.css'),
            require.resolve('@fontsource-variable/inter/wght-italic.css'),
            require.resolve('@fontsource-variable/jetbrains-mono/index.css'),
            require.resolve('./src/css/custom.scss'),
          ],
        },
      },
    ],
  ],
  plugins: [
    'docusaurus-plugin-sass',
    require.resolve('./src/plugins/mermaid-elk-stub.js'),
    [
      'docusaurus-plugin-llms',
      {
        generateLLMsTxt: true,
        generateLLMsFullTxt: true,
        generateMarkdownFiles: false,
        docsDir: 'docs',
        excludeImports: true,
        removeDuplicateHeadings: true,
        includeBlog: false,
        title: 'BASIS Courses',
        description: 'Training books for BBj and DWC developers.',
      },
    ],
    ['@docusaurus/plugin-client-redirects', {redirects: []}],
  ],
  themes: ['@docusaurus/theme-mermaid'],
  themeConfig: {
    colorMode: {respectPrefersColorScheme: true},
    // D-13: off
    // announcementBar: {
    //   id: 'dwc-moved',
    //   content: 'DWC-Course has moved here.',
    //   isCloseable: true,
    // },
    navbar: {
      title: 'BASIS Courses',
      style: 'dark',
      items: books.map((b) => ({
        type: 'docSidebar',
        sidebarId: `${b.id}Sidebar`,
        label: b.navLabel,
        position: 'left',
        className: `navbar-book book-icon--${b.id}`,
      })),
    },
    docs: {sidebar: {hideable: false, autoCollapseCategories: false}},
    prism: {
      theme: codeTheme,
      darkTheme: codeTheme,
      additionalLanguages: ['bbj', 'java', 'css', 'markup', 'javascript', 'bash', 'json'],
    },
  },
};
