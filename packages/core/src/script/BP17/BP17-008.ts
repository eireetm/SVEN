// BP17-008 Forest Guardian's Bow — Forestcraft amulet, 1. エルフ族.
// {[fanfare]} If there's an Arisa, Evergreen Arrow on your field, place 2 arrow counters on this.
// Once per turn, when a {[forestcraft]} follower is put onto your field, place an arrow counter on this. (Also during the
// opponent's turn — ruling.)
// Activate {[engage]} this, bury this: Select an enemy follower on the field and deal it X damage. X equals the number of
// arrow counters this had. (Counted as the cost buries it; targets come first, CR 10.6.2.3.)
import type { CustomCost } from "../types";
import { activated, defineCard, fanfare, whenFollowerEntersYourField } from "../helpers";
import { enemyFollower, isClass } from "../targets";
import { onYourField } from "./shared";

const buryRememberingArrows: CustomCost = {
  canPay: (g, _c, self) => g.card(self)?.zone === "field",
  *pay(fx) {
    fx.memory.arrows = fx.game.counters(fx.self, "arrow");
    yield* fx.bury([fx.self]);
  },
};

export default defineCard({
  abilities: [
    fanfare({
      condition: (g, p) => onYourField(g, p, "Arisa, Evergreen Arrow"),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.addCounters(fx.self, "arrow", 2);
      },
    }),
    whenFollowerEntersYourField(
      {
        oncePerTurn: true,
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.addCounters(fx.self, "arrow", 1);
        },
      },
      { filter: isClass("Forestcraft") },
    ),
    activated(
      { engageSelf: true, custom: buryRememberingArrows },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, Number(fx.memory.arrows ?? 0));
        },
      },
    ),
  ],
});
