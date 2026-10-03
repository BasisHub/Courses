// @docusaurus/theme-mermaid 3.10.2 fails the client bundle with
// "Can't resolve '@mermaid-js/layout-elk'" (facebook/docusaurus #11430):
// webpack resolves a dead dynamic import branch anyway. Aliasing the module
// to `false` stubs it out. Delete this plugin once a Docusaurus bump builds
// without it.
module.exports = function mermaidElkStub() {
  return {
    name: 'mermaid-elk-stub',
    configureWebpack() {
      return {resolve: {alias: {'@mermaid-js/layout-elk': false}}};
    },
  };
};
