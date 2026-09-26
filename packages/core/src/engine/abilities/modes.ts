import type { CardId, PlayerId } from "../../model/ids";
import type { Mode } from "../../script/types";
import type { EffectContext } from "../effects/context";
import { performableModes } from "../flow/play-card";
import type { G } from "../runtime/context";
import { chooseOptions } from "../runtime/decide";
import type { Proc } from "../runtime/proc";
import { makeReader, type GameReader } from "../query";
import { activeScript, passiveSources } from "../state/characteristics";
import type { Env } from "../state/access";
import { chooseTargets } from "./targets";

export interface ModeSpec {
  modes?: readonly Mode[] | undefined;
  modeCount?: ((game: GameReader, controller: PlayerId, self: CardId, playOption?: string | null) => number) | undefined;
}

/**
 * CR 5.18 — the "choose" step of playing a card or ability (10.6.2.2, 5.18.3):
 *  - only performable options can be chosen (5.18.3.1.2);
 *  - "choose one": exactly one; "choose up to N": 1 to N options (5.18.2.1), N capped at the
 *    number of options (5.18.2.3) and determined when played, e.g. Spellchain (5.18.3.1.1).
 * Returns the chosen options in listed order, or null when nothing can be chosen.
 */
export function* chooseModes(g: G, player: PlayerId, spec: ModeSpec, self: CardId, playOption: string | null = null): Proc<Mode[] | null> {
  if (!spec.modes) return [];
  const performable = performableModes(g, spec.modes, player, self);
  if (performable.length === 0) return null;
  const count = spec.modeCount ? Math.min(spec.modeCount(makeReader(g), player, self, playOption), performable.length) : 1;
  if (count <= 0) return null; // 5.18.2.2
  const options = performable.map((m) => ({ id: m.id, label: m.label }));
  const max = choosesAnyNumberOfOptions(g, player) ? performable.length : count;
  const ids = yield* chooseOptions(g, player, "mode", options, 1, max, self);
  return spec.modes.filter((m) => ids.includes(m.id));
}

/**
 * CR 5.18 — does `player` choose any number of options instead of the stated number ("If you would
 * choose 1 or more options, choose any number instead", BP20-T06 in their EX area)? Then they choose
 * 1 to all of the performable options (ruling). Scripts that choose options themselves ask
 * `GameReader.choosesAnyNumberOfOptions` (BP04-007, BP05-006, BP17-056).
 */
export function choosesAnyNumberOfOptions(env: Env, player: PlayerId): boolean {
  return passiveSources(env, player).some((id) => activeScript(env, id)?.field?.chooseAnyNumberOfOptions === true);
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
 * CR 5.18.1 — resolve the chosen options in listed order. An option written "[process]:
 * [effect]" (10.4.7.2) is only applied if its controller executes the process when it resolves
 * (10.4.7.5; BP03-117 ruling: the option may be chosen and the process not executed). An option
 * with Earth Rite is only applied if Earth Rite was paid (13.3.3.2; BP10-050 ruling).
 */
export function* resolveModes(modes: readonly Mode[], fxFor: (mode: Mode, index: number) => EffectContext): Proc<void> {
  for (const [i, m] of modes.entries()) {
    const fx = fxFor(m, i);
    if (m.earthRite && !fx.earthRitePaid) continue;
    if (m.cost && !(yield* fx.optionalCost(m.cost))) continue;
    yield* m.resolve(fx);
  }
}
