import { useEffect, useRef, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { defaults } from '../lib/storage';
import type { TeamInstructions } from '../lib/relay.js';
export function TeamDialog({ team, onSave, onClose }: { team: TeamInstructions; onSave: (draft: TeamInstructions) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState({ ...team });
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    return () => { dialog.current?.close(); previous?.focus(); };
  }, []);
  return <dialog ref={dialog} className="team-dialog" onCancel={onClose} onClick={event => { if (event.target === dialog.current) { const box = dialog.current.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) onClose(); } }} aria-labelledby="team-title">
    <header className="dialog-header"><div><h2 id="team-title">Team Instructions</h2><p className="muted small">Saved only in this browser. Used to prepare your relay prompts.</p></div><button className="button ghost compact" aria-label="Close team instructions" onClick={onClose}><X size={18}/></button></header>
    <div className="form-stack"><label>ChatGPT Lead Instructions<textarea autoFocus rows={7} value={draft.lead} onChange={e => setDraft({ ...draft, lead: e.target.value })}/></label><label>Perplexity Advisor Instructions<textarea rows={8} value={draft.advisor} onChange={e => setDraft({ ...draft, advisor: e.target.value })}/></label></div>
    <footer className="dialog-footer"><button className="button secondary" onClick={() => setDraft({ ...defaults })}><RotateCcw size={15}/>Restore defaults</button><div className="button-group"><button className="button ghost" onClick={onClose}>Cancel</button><button className="button primary" onClick={() => onSave(draft)}>Save instructions</button></div></footer>
  </dialog>;
}
