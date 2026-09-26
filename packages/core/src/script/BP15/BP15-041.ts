// BP15-041 Kuon, Wuxing Master — Runecraft follower, 5, 4/4. 挑戦者・陰陽師.
// When playing this, reveal 2 Onmyoji cards from your hand: This costs 1 less to play. (CR 10.4.7.3.)
// ----------
// {[adv]} {[cost04]}: You may summon a Noble Shikigami from your evolve deck. Activate only if there are at least
// 7 spells and/or Onmyoji cards in your cemetery. (CR 12.16; a card that is both counts once — rulings.)
// {[fanfare]} Draw a card. Discard a card.
// Activate {[engage]} this: Select an Onmyoji follower in your cemetery that costs 4 or less and summon it.
// (元のコスト.)
import { revealFromHand } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { and, costAtMost, inYourZone, isFollower, named } from "../targets";
import { hasRoom, onmyoji, spellsOrOnmyojiInCemetery } from "./shared";

export default defineCard({
  playOptions: [{ id: "reveal2", label: "Reveal 2 Onmyoji cards from your hand: costs 1 less", ...revealFromHand(onmyoji, 2), costDelta: -1 }],
  abilities: [
    activated(
      { playPoints: 4 },
      {
        advanced: true,
        condition: (g, p) => spellsOrOnmyojiInCemetery(g, p) >= 7,
        *resolve(fx) {
          // A facedown one: faceup cards in the evolve deck have been used (CR 4.6.3, 9.2.2).
          if (hasRoom(fx.game, fx.controller, "field")) yield* fx.fromEvolveDeck((id) => named("Noble Shikigami")(fx.game, id), { to: "field" });
        },
      },
    ),
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
    activated(
      { engageSelf: true },
      {
        targets: [inYourZone("cemetery", { filter: and(isFollower, onmyoji, costAtMost(4)) })],
        *resolve(fx) {
          yield* fx.putOntoField(fx.targets[0]!);
        },
      },
    ),
  ],
});
