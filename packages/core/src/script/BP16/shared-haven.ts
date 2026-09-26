// Shared pieces of BP16 Havencraft card scripts (not a card: the file name has no set prefix).
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { AutomaticAbility } from "../types";
import { atStartOfYourEndPhase } from "../helpers";
import { isAmulet } from "../targets";
import { countIn } from "./shared";

/** "the number of amulets on your field" (BP16-094, 095; BP17-091, 092, 109). */
export const amuletsOnField = (g: GameReader, p: PlayerId): number => countIn(g, p, "field", isAmulet);

/** BP16-094 / 095 "At the start of your end phase, if there are at least 2 amulets on your field, give your leader +2." */
export const rodeoBlessing: AutomaticAbility = atStartOfYourEndPhase({
  condition: (g, p) => amuletsOnField(g, p) >= 2,
  *resolve(fx) {
    yield* fx.giveLeaderDefense(fx.controller, 2);
  },
});
