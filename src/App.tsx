import { useMemo, useState } from 'react';
import { ArrowRightLeft, Users, WandSparkles, LogOut, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { AccessGate } from './components/AccessGate';
import { Pane } from './components/Pane';
import { TeamDialog } from './components/TeamDialog';
import { buildLeadBrief, buildAdvisorPrompt, buildFinalHandoff, inspectAdvisory, type TeamInstructions } from './lib/relay.js';
import { readTeam, saveTeam } from './lib/storage';
import { supabase } from './lib/supabase';
export default function App() { return <AccessGate><Relay/></AccessGate>; }
function Relay() {
  const [objective, setObjective] = useState('');
  const [prepared, setPrepared] = useState('');
  const [advisory, setAdvisory] = useState('');
  const [team, setTeam] = useState<TeamInstructions>(readTeam);
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const lead = useMemo(() => prepared ? buildLeadBrief(prepared, team) : '', [prepared, team]);
  const advisor = useMemo(() => prepared ? buildAdvisorPrompt(prepared, team) : '', [prepared, team]);
  const inspected = useMemo(() => inspectAdvisory(advisory, advisor), [advisory, advisor]);
  const handoff = useMemo(() => prepared && inspected.text && !inspected.blocked ? buildFinalHandoff(prepared, inspected.text, team) : '', [prepared, inspected, team]);
  const dirty = Boolean(prepared) && objective.trim() !== prepared;
  function prepare() {
    const next = objective.trim(); if (!next) return;
    if (prepared && prepared !== next && advisory.trim() && !window.confirm('This changes the objective. Clear the previous advisory and start a new relay?')) return;
    if (prepared !== next) setAdvisory('');
    setPrepared(next); toast.success('Relay prompts prepared');
  }
  function updateTeam(draft: TeamInstructions) {
    const stored = saveTeam(draft); setTeam(draft); setOpen(false);
    if (stored) toast.success('Team instructions saved in this browser');
    else toast.warning('Browser storage is unavailable. Instructions apply for this session only.');
  }
  async function signOut() {
    if (!supabase) return;
    if ((objective.trim() || advisory.trim()) && !window.confirm('Sign out? Unsaved objective and advisory text will be cleared.')) return;
    setSigningOut(true);
    try { const { error } = await supabase.auth.signOut(); if (error) throw error; }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Sign-out failed.'); }
    finally { setSigningOut(false); }
  }
  return <main className="workspace">
    <header className="topbar"><div><div className="brand-row"><ArrowRightLeft className="brand-icon"/><h1 className="brand">Duo Relay Lab</h1><span className="badge">MANUAL · ZERO MODEL API COST</span></div><p className="muted subtitle">You decide. ChatGPT leads. Perplexity advises. You carry the messages by hand.</p></div><div className="button-group"><button className="button ghost" disabled={signingOut} onClick={() => void signOut()}><LogOut size={16}/>{signingOut ? 'Signing out…' : 'Sign out'}</button><button className="button secondary" onClick={() => setOpen(true)}><Users size={16}/>Team Instructions</button></div></header>
    <section className="workflow-strip" aria-label="Relay workflow"><span>Owner objective</span><span aria-hidden="true">→</span><span>ChatGPT lead brief</span><span aria-hidden="true">→</span><span>Perplexity research</span><span aria-hidden="true">→</span><span>ChatGPT synthesis</span></section>
    {open && <TeamDialog team={team} onSave={updateTeam} onClose={() => setOpen(false)}/>}
    <section className="panel objective-panel"><label className="eyebrow" htmlFor="objective">Owner Objective</label><textarea id="objective" className="objective-input" value={objective} onChange={e => setObjective(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); prepare(); } }} placeholder="What do you want decided or delivered?" rows={4}/><div className="panel-footer"><p className="muted small"><ShieldCheck size={15}/>Prompts are built locally. Nothing is sent to an AI service.</p><button className="button primary" disabled={!objective.trim()} onClick={prepare}><WandSparkles size={16}/>{dirty ? 'Update Relay' : 'Prepare Relay'}</button></div><p className="muted small shortcut">Shortcut: Ctrl / ⌘ + Enter</p></section>
    {dirty && <p className="notice" role="status">Your objective has changed. Update the relay before copying. The current prompts still use the previous objective.</p>}
    {prepared ? <>
      <section className="relay-grid"><Pane step="1" title="ChatGPT Lead Brief" hint="Paste into your ChatGPT conversation." text={lead}/><Pane step="2" title="Perplexity Advisory Prompt" hint="Paste into Perplexity, then copy its reply." text={advisor}/></section>
      <section className="panel advisory-panel"><label htmlFor="advisory" className="eyebrow">Step 3 · Paste Perplexity’s response</label><p className="muted small">Paste the answer, including sources—not the prompt you sent.</p><textarea id="advisory" rows={8} value={advisory} onChange={e => setAdvisory(e.target.value)} placeholder="Paste the full Perplexity reply here, including sources…"/>{inspected.warning && <p className="notice" role="status">{inspected.warning}</p>}</section>
      {handoff ? <Pane step="4" title="Final ChatGPT Handoff" hint="Paste back into the same ChatGPT conversation for synthesis." text={handoff} primary/> : <section className="panel empty-state"><p>{inspected.blocked ? 'Paste the actual response to generate the final handoff.' : 'The final handoff appears once a Perplexity response is pasted above.'}</p></section>}
    </> : <section className="empty-state"><ArrowRightLeft size={30}/><h2>One objective. A coordinated relay.</h2><p>A lead brief, an advisory prompt, and a final handoff—without connecting any model APIs.</p></section>}
    <footer className="site-footer"><p>Owner → ChatGPT lead → Perplexity advisor</p><p>Objective and research stay in this tab’s memory. Team instructions stay in this browser. Authentication uses Supabase.</p></footer>
  </main>;
}
