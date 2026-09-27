// ECP01-031 Katsuragi Ace — Dragoncraft follower, 7, 5/4. ウマ娘.
// When this card is discarded by the ability of an Umamusume card you control, if Overflow is active for you, {[cost03]}: Summon
// this card. (From your hand. Overflow is checked when it is played: Neo Universe's option that discarded it increases your max
// play points first; the cost may be left unpaid — rulings.)
// ----------
// {[feed]} {[cost01]}: Race this follower.
// Storm.
// {[fanfare]} Select an enemy follower on the field and destroy it.
import { playPointsCost } from "../costs";
import { defineCard, fanfare, serveAbility, whenDiscardedByYourCard } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    whenDiscardedByYourCard(
      {
        cost: playPointsCost(3),
        condition: (g, c) => g.overflow(c),
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "cemetery") yield* fx.putOntoField([fx.self]);
        },
      },
      (cause) => cause.traits.includes("ウマ娘"),
    ),
    serveAbility(1, 1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
