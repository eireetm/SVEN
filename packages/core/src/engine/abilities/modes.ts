import type { CardId, PlayerId } from "../../model/ids";
import type { Mode } from "../../script/types";
import { performableModes } from "../flow/play-card";
import type { G } from "../runtime/context";
import { chooseOptions, confirm } from "../runtime/decide";
import type { Proc } from "../runtime/proc";
import { makeReader, type GameReader } from "../query";
import { chooseTargets } from "./targets";

export interface ModeSpec {
  modes?: readonly Mode[] | undefined;
  modeCount?: ((game: GameReader, controller: PlayerId, self: CardId) => number) | undefined;
}

/**
 * CR 5.18 — the "choose" step of playing a card or ability (10.6.2.2, 5.18.3):
 *  - only performable options can be chosen (5.18.3.1.2);
 *  - "choose one": exactly one; "choose up to N": 1 to N options (5.18.2.1), N capped at the
 *    number of options (5.18.2.3) and determined when played, e.g. Spellchain (5.18.3.1.1).
 * Returns the chosen options in listed order, or null when nothing can be chosen.
 */
export function* chooseModes(g: G, player: PlayerId, spec: ModeSpec, self: CardId): Proc<Mode[] | null> {
  if (!spec.modes) return [];
  const performable = performableModes(g, spec.modes, player, self);
  if (performable.length === 0) return null;
  const count = spec.modeCount ? Math.min(spec.modeCount(makeReader(g), player, self), performable.length) : 1;
  if (count <= 0) return null; // 5.18.2.2
  const options = performable.map((m) => ({ id: m.id, label: m.label }));
  const ids = yield* chooseOptions(g, player, "mode", options, 1, count, self);
  return spec.modes.filter((m) => ids.includes(m.id));
}

/**
 * CR 10.6.2.3 — select the targets of each chosen option, in listed order. Options that were
 * not chosen are treated as if they didn't exist (5.18.4, 5.18.4.1). null = impossible.
 */
export function* chooseModeTargets(g: G, player: PlayerId, modes: readonly Mode[], self: CardId): Proc<CardId[][][] | null> {
  const all: CardId[][][] = [];
  for (const mode of modes) {
    const targets = yield* chooseTargets(g, mode.targets, player, self);
    if (targets === null) return null;
    all.push(targets);
  }
  return all;
}

/**
 * An option written "[cost]: [effect]" has an optional additional cost (BP03-117 ruling: the
 * player may choose the option and not pay; the option then does nothing). The choice is made
 * while playing (10.6.2.2.1) and the cost is paid with the other costs (10.6.2.5).
 * Returns, per chosen option, whether its cost will be paid (false for options without one).
 */
export function* chooseModeCosts(g: G, player: PlayerId, modes: readonly Mode[], self: CardId): Proc<boolean[]> {
  const reader = makeReader(g);
  const paid: boolean[] = [];
  for (const m of modes) {
    paid.push(m.cost !== undefined && m.cost.canPay(reader, player, self) && (yield* confirm(g, player, "optionalCost", self)));
  }
  return paid;
}
