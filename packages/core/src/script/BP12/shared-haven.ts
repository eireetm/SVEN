// BP12 Havencraft abilities shared by a card and its evolved card (not a card).
import type { ActivatedAbility, AutomaticAbility } from "../types";
import { activated, atStartOfYourEndPhase } from "../helpers";
import { banishFromYourEx } from "../costs";
import { isRepairMode } from "./shared";

/**
 * BP12-089 / 090 "Activate, banish 2 cards named Repair Mode from your EX area: Give this follower
 * Storm."
 */
export const galliasStorm: ActivatedAbility = activated(
  { custom: banishFromYourEx(isRepairMode, 2) },
  {
    *resolve(fx) {
      if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
    },
  },
);

/**
 * BP12-093 / 094 "At the start of your end phase, give this follower +X attack, where X equals the
 * number of followers with Ward on your field."
 */
export const convertEndPhase: AutomaticAbility = atStartOfYourEndPhase({
  *resolve(fx) {
    if (fx.game.card(fx.self)?.zone !== "field") return;
    const x = fx.game.followers(fx.controller).filter((id) => fx.game.hasKeyword(id, "ward")).length;
    if (x > 0) yield* fx.giveStats(fx.self, x, 0);
  },
});
