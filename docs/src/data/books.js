// Order here is the landing page order and the navbar order.
// The ids (intro-bbj, dwc) are permanent URL slugs.
module.exports = [
  {
    id: 'intro-bbj',
    title: 'Introduction to BBj Development',
    navLabel: 'BBj Basics',
    icon: 'code',
    description:
      'You already write software in another language. Learn to set up BBj and build GUI and browser applications with it.',
    to: '/docs/intro-bbj/overview',
  },
  {
    id: 'dwc',
    title: 'BBj DWC Training',
    navLabel: 'DWC',
    icon: 'browser',
    description:
      'Build modern browser applications with the Dynamic Web Client, from first concepts to deployment.',
    to: '/docs/dwc/overview',
  },
];
