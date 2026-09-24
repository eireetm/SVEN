/**
 * Keyword abilities that the rules engine itself consults (CR 12, 13). Keywords that are only
 * "automatic ability timings" (Fanfare, Last Words, On Evolve, Strike, ...) are not listed
 * here: they are ability kinds, see `script/types.ts`.
 */
export type Keyword =
  | "quick" // CR 12.3.2 (standalone Quick on a card)
  | "ward" // CR 12.8
  | "storm" // CR 12.9
  | "rush" // CR 12.10
  | "assail" // CR 12.11
  | "intimidate" // CR 12.12
  | "drain" // CR 12.13
  | "bane" // CR 12.14
  | "aura" // CR 12.15
  | "stack"; // CR 13.3.2

/**
 * Keywords the engine implements. Scripts may only use these (checked when an engine is
 * created, and when an effect gives a keyword), so a card can never silently lose a keyword
 * the engine does not know yet.
 * Drain (CR 12.13) heals the controller's leader when the follower deals attack damage.
 */
export const IMPLEMENTED_KEYWORDS: readonly Keyword[] = [
  "quick",
  "ward",
  "storm",
  "rush",
  "assail",
  "intimidate",
  "bane",
  "aura",
  "stack",
  "drain",
];
