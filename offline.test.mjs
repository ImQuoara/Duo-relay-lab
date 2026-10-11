import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const html = readFileSync(new URL('../offline.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
function app() {
  const elements = new Map();
  const storage = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id, { value: '', hidden: false, textContent: '', disabled: false, events: {}, addEventListener(name, handler) { this.events[name] = handler; }, showModal() {}, close() {}, focus() {}, select() {} });
    return elements.get(id);
  };
  const context = {
    document: { getElementById: get, querySelectorAll: () => [] },
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    navigator: {}, confirm: () => true,
    fetch: () => { throw new Error('Network forbidden'); }
  };
  vm.runInNewContext(script, context);
  return { get, storage, input: (id, value) => { get(id).value = value; get(id).events.input?.(); }, click: id => get(id).events.click() };
}
test('offline edition contains no external scripts, stylesheets or network implementation', () => {
  assert.equal(/<script[^>]+src=|<link[^>]+href=/i.test(html), false);
  assert.equal(/\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b/.test(script), false);
});
test('offline objective prepares both prompts and a research answer prepares handoff', () => {
  const page = app(); page.input('objective', 'Plan a beta release.'); page.click('prepare');
  assert.ok(page.get('lead').value.includes('Plan a beta release.'));
  assert.ok(page.get('advisor').value.includes('advisory'));
  page.input('research', 'VERIFIED FACT: The owner provided a product specification. INFERENCE: Testing should precede release.');
  assert.ok(page.get('final').value.includes('FINAL CHATGPT HANDOFF'));
  assert.equal(page.get('final-pane').hidden, false);
});
test('offline pasted prompt is blocked and changed objective clears research', () => {
  const page = app(); page.input('objective', 'Initial objective'); page.click('prepare');
  page.input('research', page.get('advisor').value);
  assert.equal(page.get('final-pane').hidden, true);
  assert.ok(page.get('warning').textContent.includes('prompt, not Perplexity'));
  page.input('objective', 'Changed objective'); page.click('prepare');
  assert.equal(page.get('research').value, '');
  assert.ok(page.get('lead').value.includes('Changed objective'));
});
test('offline team instruction edits are stored and flow into prompts', () => {
  const page = app(); page.click('team-open');
  page.get('team-lead').value = 'My lead instructions';
  page.get('team-advisor').value = 'My advisor instructions'; page.click('team-save');
  assert.equal(page.storage.get('duo_relay_lead_instructions'), 'My lead instructions');
  page.input('objective', 'Example objective'); page.click('prepare');
  assert.ok(page.get('lead').value.includes('My lead instructions'));
  assert.ok(page.get('advisor').value.includes('My advisor instructions'));
});
