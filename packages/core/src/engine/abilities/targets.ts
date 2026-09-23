import type { CardId, PlayerId } from "../../model/ids";
import type { TargetSpec } from "../../script/types";
import { EngineError } from "../errors";
import type { G } from "../runtime/context";
import type { Env } from "../state/access";
import { selectCards } from "../runtime/decide";
import type { Proc } from "../runtime/proc";
import { hasKeyword } from "../state/characteristics";
import { makeReader } from "../query";

/**
 * CR 12.15.2 — a card with Aura cannot be selected by an opponent's cards or abilities; it
 * only protects on the field (BP01-111 / BP01-156 rulings).
 */
export function selectableBy(g: Env, card: CardId, player: PlayerId): boolean {
  const c = g.state.cards[card];
  if (!c) return false;
  return !(c.zone === "field" && c.controller !== player && hasKeyword(g, card, "aura"));
}

function candidatesOf(g: Env, spec: TargetSpec, controller: PlayerId, self: CardId): CardId[] {
  const reader = makeReader(g);
  if (spec.when && !spec.when(reader, controller, self)) return [];
  return spec.candidates(reader, controller, self).filter((id) => selectableBy(g, id, controller));
}

/**
 * CR 10.6.2.3 target counts (interpretation confirmed by the project owner, see
 * docs/open-questions.md):
 *  - "select N" (10.6.2.3.1 / 10.6.2.3.3): exactly N targets; with fewer than N legal
 *    targets the card or ability cannot be played at all;
 *  - "select up to N" (10.6.2.3.2): any number from 0 to N, so it never blocks playing;
 *  - a selection whose `when` condition is false is not part of the effect.
 */
function required(g: Env, spec: TargetSpec, controller: PlayerId, self: CardId): number {
  if (spec.upTo) return 0;
  if (spec.when && !spec.when(makeReader(g), controller, self)) return 0;
  return spec.count;
}

/**
 * Can every target selection of a card / ability be made? Used to decide whether playing is
 * offered at all: illegal plays are never selectable (CR 10.6.2.1.2), so the engine never
 * has to "return to the point before the play" (10.6.2.3.3).
 */
export function targetsAvailable(g: Env, specs: readonly TargetSpec[] | undefined, controller: PlayerId, self: CardId): boolean {
  if (!specs) return true;
  return specs.every((s) => candidatesOf(g, s, controller, self).length >= required(g, s, controller, self));
}

/**
 * CR 10.6.2.3 — select targets while playing a card or ability.
 * Returns null when the selection cannot be made (for automatic abilities this means the
 * ability cannot be played, CR 10.7.3.2).
 */
export function* chooseTargets(
  g: G,
  specs: readonly TargetSpec[] | undefined,
  controller: PlayerId,
  self: CardId,
): Proc<CardId[][] | null> {
  if (!specs || specs.length === 0) return [];
  if (!targetsAvailable(g, specs, controller, self)) return null;
  const chosen: CardId[][] = [];
  for (const spec of specs) {
    if (spec.count < 0) throw new EngineError("negative target count");
    const candidates = candidatesOf(g, spec, controller, self);
    const max = Math.min(spec.count, candidates.length);
    const min = required(g, spec, controller, self);
    // Selecting does not change the state, so targetsAvailable() above guarantees this.
    if (min > max) throw new EngineError("target selection became impossible after playing started");
    chosen.push(yield* selectCards(g, controller, "target", candidates, min, max, self));
  }
  return chosen;
}
