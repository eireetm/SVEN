// BP10-062 Eternal Whale — Dragoncraft follower, 5, 5/6. 海洋.
// Ward.
// {[fanfare]} If this card was played from the EX area, recover 4 play points.
// {[lastwords]} Deal 2 damage to each enemy leader. Put this card into its owner's deck 2nd from the top
// or on the bottom. (Its owner's deck even when another player controlled it — ruling.)
import { defineCard, enteredByAbility, fanfare, lastWords } from "../helpers";

const POSITIONS = [
  { id: "second", label: "2nd from the top of its owner's deck" },
  { id: "bottom", label: "The bottom of its owner's deck" },
];

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        // Played (not put onto the field by an ability) from the EX area (CR 5.5.3).
        if (fx.game.enteredFrom(fx.self) === "ex" && !enteredByAbility(fx)) yield* fx.recoverPlayPoints(4);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
        if (fx.game.card(fx.self)?.zone !== "cemetery") return;
        const [position] = yield* fx.choose(POSITIONS);
        if (position === "second") yield* fx.putIntoDeckAt(fx.self, 2);
        else yield* fx.putOnDeck([fx.self], "bottom");
      },
    }),
  ],
});
