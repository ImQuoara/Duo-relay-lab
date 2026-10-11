import { DEFAULT_LEAD_INSTRUCTIONS, DEFAULT_ADVISOR_INSTRUCTIONS, LS_LEAD, LS_ADVISOR, type TeamInstructions } from './relay.js';
export const defaults: TeamInstructions = { lead: DEFAULT_LEAD_INSTRUCTIONS, advisor: DEFAULT_ADVISOR_INSTRUCTIONS };
export function readTeam(): TeamInstructions {
  try { return { lead: localStorage.getItem(LS_LEAD) ?? defaults.lead, advisor: localStorage.getItem(LS_ADVISOR) ?? defaults.advisor }; }
  catch { return { ...defaults }; }
}
export function saveTeam(team: TeamInstructions): boolean {
  try {
    const before = [localStorage.getItem(LS_LEAD), localStorage.getItem(LS_ADVISOR)];
    try { localStorage.setItem(LS_LEAD, team.lead); localStorage.setItem(LS_ADVISOR, team.advisor); }
    catch (error) {
      try { [LS_LEAD, LS_ADVISOR].forEach((key, i) => before[i] === null ? localStorage.removeItem(key) : localStorage.setItem(key, before[i]!)); } catch { /* Storage unavailable. */ }
      throw error;
    }
    return true;
  } catch { return false; }
}
