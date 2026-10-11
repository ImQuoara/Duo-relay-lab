import { useRef } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
export function Pane({ step, title, hint, text, primary = false }: { step: string; title: string; hint: string; text: string; primary?: boolean }) {
  const output = useRef<HTMLTextAreaElement>(null);
  async function copy() {
    try { await navigator.clipboard.writeText(text); toast.success(`${title} copied`); }
    catch {
      output.current?.focus(); output.current?.select();
      toast.error('Clipboard permission unavailable. The text is selected; use your device’s Copy command.');
    }
  }
  return <article className={`panel output-panel ${primary ? 'final-panel' : ''}`}>
    <header className="pane-heading"><div><p className="eyebrow">Step {step}</p><h2>{title}</h2><p className="muted small">{hint}</p></div><button className="button secondary compact" type="button" aria-label={`Copy ${title}`} onClick={() => void copy()}><Copy size={16}/>Copy</button></header>
    <textarea ref={output} className="output-text" aria-label={title} readOnly value={text} spellCheck={false}/>
  </article>;
}
