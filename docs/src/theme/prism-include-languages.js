import prismIncludeLanguages from '@theme-original/prism-include-languages';
import extendBbj from '../prism/bbj-extend';
import classList from '../prism/bbj-classes.json';

// Wraps the original loader: it loads prism-bbj (themeConfig.prism.additionalLanguages),
// then the local patch fixes the grammar on the same Prism instance.
export default function prismIncludeLanguagesWrapped(PrismObject) {
  prismIncludeLanguages(PrismObject);
  extendBbj(PrismObject, classList.classes);
}
