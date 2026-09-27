import type { CardId, PlayerId } from "../../model/ids";
import type { PlayContext, TargetSpec } from "../../script/types";
import { EngineError } from "../errors";
import type { G } from "../runtime/context";
import type { Env } from "../state/access";
import { selectCards } from "../runtime/decide";
import type { Proc } from "../runtime/proc";
import { makeReader } from "../query";

/**
 * CR 12.15.2 — a card with Aura cannot be selected by an opponent's cards or abilities; it
 * only protects on the field (BP01-111 / BP01-156 rulings).
 */
export function selectableBy(g: Env, card: CardId, player: PlayerId): boolean {
  return makeReader(g).canSelect(card, player);
}

function candidatesOf(g: Env, spec: TargetSpec, controller: PlayerId, self: CardId, play?: PlayContext): CardId[] {
  const reader = makeReader(g);
  if (spec.when && !spec.when(reader, controller, self)) return [];
  return spec.candidates(reader, controller, self, play).filter((id) => selectableBy(g, id, controller));
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
export function targetsAvailable(
  g: Env,
  specs: readonly TargetSpec[] | undefined,
  controller: PlayerId,
  self: CardId,
  play?: PlayContext,
): boolean {
  if (!specs) return true;
  return feasibleFrom(g, specs, controller, self, 0, [], play);
}

/**
 * Can the selections from `index` on all be made, given the cards `used` by the earlier ones? A `distinct`
 * selection can't take a card an earlier one took (BP20-084 "a 5-cost or less ... and a 3-cost or less ...":
 * two different cards, both needed — rulings), so a required selection followed by one is tried card by card.
 */
function feasibleFrom(
  g: Env,
  specs: readonly TargetSpec[],
  controller: PlayerId,
  self: CardId,
  index: number,
  used: readonly CardId[],
  play?: PlayContext,
): boolean {
  const spec = specs[index];
  if (!spec) return true;
  const need = required(g, spec, controller, self);
  const candidates = candidatesOf(g, spec, controller, self, play).filter((id) => !(spec.distinct && used.includes(id)));
  if (candidates.length < need) return false;
  const laterDistinct = specs.slice(index + 1).some((t) => t.distinct && required(g, t, controller, self) > 0);
  // An "up to" selection can take nothing, so it never stands in a later one's way.
  if (need === 0 || !laterDistinct) return feasibleFrom(g, specs, controller, self, index + 1, used, play);
  if (need !== 1) throw new EngineError("a required selection before a distinct one must be of 1 card");
  return candidates.some((c) => feasibleFrom(g, specs, controller, self, index + 1, [...used, c], play));
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
  play?: PlayContext,
): Proc<CardId[][] | null> {
  if (!specs || specs.length === 0) return [];
  if (!targetsAvailable(g, specs, controller, self, play)) return null;
  const chosen: CardId[][] = [];
  for (const [index, spec] of specs.entries()) {
    if (spec.count < 0) throw new EngineError("negative target count");
    if (spec.max && !spec.upTo) throw new EngineError("a target maximum is only for \"up to\" selections");
    if (spec.distinctNames && !spec.upTo) throw new EngineError("targets with different names are only for \"up to\" selections");
    if (spec.distinct && !spec.upTo && spec.count !== 1) throw new EngineError("a required distinct selection must be of 1 card");
    const earlier = chosen.flat();
    // Only choices after which the later selections can still be made (the principle of CR 10.6.2.1.2).
    const constrained =
      required(g, spec, controller, self) > 0 && specs.slice(index + 1).some((t) => t.distinct && required(g, t, controller, self) > 0);
    const candidates = candidatesOf(g, spec, controller, self, play).filter(
      (id) =>
        !(spec.distinct && earlier.includes(id)) && (!constrained || feasibleFrom(g, specs, controller, self, index + 1, [...earlier, id], play)),
    );
    const cap = spec.max ? Math.max(0, spec.max(makeReader(g), controller, self, play)) : spec.count;
    const max = Math.min(spec.count, cap, candidates.length);
    const min = required(g, spec, controller, self);
    // Selecting does not change the state, so targetsAvailable() above guarantees this.
    if (min > max) throw new EngineError("target selection became impossible after playing started");
    if (spec.distinctNames) {
      // "... with different names": one at a time, only names not selected yet (CR 10.6.2.3.2 "up to").
      const picked: CardId[] = [];
      const reader = makeReader(g);
      const names = (id: CardId) => reader.info(id).names;
      while (picked.length < max) {
        const left = candidates.filter((id) => !picked.includes(id) && !picked.some((p) => names(p).some((n) => names(id).includes(n))));
        const [one] = yield* selectCards(g, controller, "target", left, 0, Math.min(1, left.length), self);
        if (one === undefined) break;
        picked.push(one);
      }
      chosen.push(picked);
      continue;
    }
    chosen.push(yield* selectCards(g, controller, "target", candidates, min, max, self));
  }
  return chosen;
}
