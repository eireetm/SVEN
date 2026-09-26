// Shared pieces of BP16 Swordcraft card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { EffectContext } from "../../engine/effects/context";
import type { GameReader } from "../../engine/query";
import type { Proc } from "../../engine/runtime/proc";
import type { AutomaticAbility } from "../types";
import { atStartOfYourEndPhase } from "../helpers";
import { isToken } from "../targets";
import { KNIGHT, officer, officerTokenNames, SHIELD_GUARDIAN, STEELCLAD } from "./shared";

/** An Officer token follower (BP16-024, 025, 033, 036). */
export const officerTokenFollower = (g: GameReader, id: CardId): boolean => g.info(id).type === "follower" && isToken(g, id) && officer(g, id);

/** "Activate only if there are at least 3 Officer token followers on your field with different names". */
export const threeOfficerNames = (g: GameReader, p: PlayerId): boolean => officerTokenNames(g, p) >= 3;

/**
 * "Summon / put into your EX area a [name A] or [name B] ... token": the player picks one of the names. With
 * `optional`, "you may" — putting none is allowed.
 */
export function* oneOfTokens(fx: EffectContext, names: readonly string[], to: "field" | "ex", optional = false): Proc<void> {
  const options = names.map((name) => ({ id: name, label: name }));
  if (optional) options.push({ id: "none", label: "None" });
  const [pick] = yield* fx.choose(options);
  if (pick === undefined || pick === "none") return;
  if (to === "field") yield* fx.summon([pick]);
  else yield* fx.tokensToEx([pick]);
}

/**
 * BP16-019 / 020 "At the start of your end phase, you may put a Steelclad Knight, Shield Guardian, or Knight
 * token into your EX area."
 */
export const ameliaSupplies: AutomaticAbility = atStartOfYourEndPhase({
  *resolve(fx) {
    yield* oneOfTokens(fx, [STEELCLAD, SHIELD_GUARDIAN, KNIGHT], "ex", true);
  },
});
