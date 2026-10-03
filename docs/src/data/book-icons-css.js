const fs = require('fs');
const books = require('./books');

// Builds `--book-icon` data-URI CSS rules from Tabler SVGs at build time.
// The path is resolved through the package's `exports` map ("./*" ->
// "./icons/*"), so it survives hoisting and workspaces. require.resolve throws
// on a missing icon, which fails the build loudly.
module.exports = function bookIconsCss() {
  return books
    .map((b) => {
      const file = require.resolve(`@tabler/icons/outline/${b.icon}.svg`);
      const svg = fs.readFileSync(file, 'utf8').trim();
      const uri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
      return `.book-icon--${b.id}{--book-icon:url("${uri}")}`;
    })
    .join('\n');
};
