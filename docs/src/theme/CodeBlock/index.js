import React from 'react';
import CodeBlock from '@theme-original/CodeBlock';
import {CollapsibleShell} from '@site/src/components/DocsTools/ExpandableCode';

export const COLLAPSE_AFTER_LINES = 40;

export default function CodeBlockWrapper(props) {
  const {noCollapse, ...rest} = props;
  if (noCollapse || typeof rest.children !== 'string') {
    return <CodeBlock {...rest} />;
  }
  const lineCount = rest.children.replace(/\n$/, '').split('\n').length;
  if (lineCount > COLLAPSE_AFTER_LINES) {
    return (
      <CollapsibleShell
        lineCount={lineCount}
        previewLines={COLLAPSE_AFTER_LINES}>
        <CodeBlock {...rest} />
      </CollapsibleShell>
    );
  }
  return <CodeBlock {...rest} />;
}
