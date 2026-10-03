// @docusaurus/theme-mermaid 3.10.2 fails the client bundle with
// "Can't resolve '@mermaid-js/layout-elk'" (facebook/docusaurus #11430):
// webpack resolves a dead dynamic import branch anyway. Aliasing the module
// to `false` stubs it out. Delete this plugin once a Docusaurus bump builds
// without it.
//
// Side effect: the elk layout is unavailable. A diagram that sets
// `layout: elk` would get an empty module and fail in the browser at runtime,
// not at build time. loadContent() therefore fails the build if any doc
// requests the elk layout, so the problem cannot slip through silently.
const fs = require('fs');
const path = require('path');

const ELK = /\blayout\s*:\s*['"]?elk\b/;

function findElkUsers(dir) {
  const hits = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      hits.push(...findElkUsers(full));
    } else if (/\.mdx?$/.test(entry.name) && ELK.test(fs.readFileSync(full, 'utf8'))) {
      hits.push(full);
    }
  }
  return hits;
}

module.exports = function mermaidElkStub(context) {
  return {
    name: 'mermaid-elk-stub',
    async loadContent() {
      const docsDir = path.join(context.siteDir, 'docs');
      const hits = fs.existsSync(docsDir) ? findElkUsers(docsDir) : [];
      if (hits.length > 0) {
        throw new Error(
          `Mermaid "layout: elk" is not supported (mermaid-elk-stub aliases ` +
            `@mermaid-js/layout-elk to an empty module). Used in:\n  ${hits.join('\n  ')}`,
        );
      }
    },
    configureWebpack() {
      return {resolve: {alias: {'@mermaid-js/layout-elk': false}}};
    },
  };
};
