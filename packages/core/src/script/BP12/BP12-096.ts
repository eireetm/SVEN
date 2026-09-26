// BP12-096 Salvation Ex Limonia — Havencraft spell, 2. 機械・信仰・狂信・偶像.
// When playing this card, discard a Heavenly Aegis: This card costs 2 less to play. (CR 10.4.7.3)
// ----------
// Select a Machina follower that costs 3 or less in your cemetery and summon it. If it's a Limonia,
// Flawed Saint, put a Repair Mode token into your EX area. (Also when a full field keeps Limonia in the
// cemetery — ruling.)
import { defineCard, spell } from "../helpers";
import { discardA } from "../costs";
import { and, costAtMost, inYourZone, isFollower, named } from "../targets";
import { REPAIR, machina } from "./shared";

export default defineCard({
  playOptions: [{ id: "aegis", label: "Discard a Heavenly Aegis: costs 2 less", ...discardA(named("Heavenly Aegis")), costDelta: -2 }],
  abilities: [
    spell({
      targets: [inYourZone("cemetery", { filter: and(isFollower, machina, costAtMost(3)) })],
      *resolve(fx) {
        const card = fx.targets[0]![0]!;
        const limonia = fx.game.card(card) !== undefined && named("Limonia, Flawed Saint")(fx.game, card);
        yield* fx.putOntoField([card]);
        if (limonia) yield* fx.tokensToEx([REPAIR]);
      },
    }),
  ],
});
