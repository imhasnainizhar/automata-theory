import katex from 'katex';

function render(t: string, displayMode: boolean) {
  return katex.renderToString(t, { displayMode, throwOnError: false, strict: 'ignore', output: 'htmlAndMathml' });
}

/** Inline math. JSX attribute strings keep backslashes, so write <M t="\delta : Q \to Q" />. */
export function M({ t }: { t: string }) {
  return <span dangerouslySetInnerHTML={{ __html: render(t, false) }} />;
}

/** Display math. */
export function MB({ t }: { t: string }) {
  return <div className="math-block" data-scroll="x" dangerouslySetInnerHTML={{ __html: render(t, true) }} />;
}
