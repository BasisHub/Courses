// Copied from webforj/webforj-documentation and modified (MIT, (c) 2022 webforJ; see LICENSES/webforJ-MIT.txt).
// Local change: no MUI; the full code is rendered and clipped with CSS so the copy button copies everything.
import React, {useState} from 'react';
import CodeBlock from '@theme/CodeBlock';
import './styles.css';

export function CollapsibleShell({lineCount, previewLines = 40, children}) {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div
      className={
        'expandable-code' + (collapsed ? ' expandable-code--collapsed' : '')
      }
      style={{'--expandable-preview-lines': previewLines}}>
      <div className="expandable-code__body">{children}</div>
      <button
        type="button"
        className="expandable-code__toggle"
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((value) => !value)}>
        <svg
          className="expandable-code__chevron"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          aria-hidden="true"
          focusable="false">
          <path
            d="M8 5l8 7-8 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {collapsed ? `Show all ${lineCount} lines` : 'Show less'}
      </button>
    </div>
  );
}

export default function ExpandableCode({
  children,
  language,
  title,
  previewLines = 40,
}) {
  const code = typeof children === 'string' ? children.replace(/\n$/, '') : '';
  const lineCount = code.split('\n').length;
  return (
    <CollapsibleShell lineCount={lineCount} previewLines={previewLines}>
      <CodeBlock language={language} title={title} noCollapse>
        {code}
      </CodeBlock>
    </CollapsibleShell>
  );
}
