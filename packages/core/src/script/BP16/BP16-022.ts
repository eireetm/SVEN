// BP16-022 Ginne, Bewitching Courtesan — Swordcraft follower, 2, 3/2. 宴楽.
// {[fanfare]} Choose up to 2. If there's a Jiemon, Thief Lord on your field, choose up to 3 instead. (1) Select an
// enemy follower on the field and engage it. It doesn't refresh during its controller's next start phase. (2)
// Draw a card. Put a card from your hand on the top or bottom of your deck. (3) Put 2 Glittering Gold tokens into
// your EX area. (Targets are selected while playing it; an engaged follower may be selected and still doesn't
// refresh; (1) needs its target; each option once — rulings.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { GLITTERING_GOLD, onYourField } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      modeCount: (g, p) => (onYourField(g, p, "Jiemon, Thief Lord") ? 3 : 2),
      modes: [
        {
          id: "engage",
          label: "(1) Engage an enemy follower; it doesn't refresh next start phase",
          targets: [enemyFollower()],
          *resolve(fx) {
            const target = fx.targets[0]![0]!;
            yield* fx.engage([target]);
            yield* fx.skipNextRefresh(target);
          },
        },
        {
          id: "draw",
          label: "(2) Draw, then a card from your hand on the top or bottom of your deck",
          *resolve(fx) {
            yield* fx.draw(1);
            const [card] = yield* fx.chooseCards(fx.game.cards(fx.controller, "hand"), 1, 1);
            if (card === undefined) return;
            const [where] = yield* fx.choose([
              { id: "top", label: "The top of your deck" },
              { id: "bottom", label: "The bottom of your deck" },
            ]);
            yield* fx.putOnDeck([card], where === "top" ? "top" : "bottom");
          },
        },
        {
          id: "gold",
          label: "(3) 2 Glittering Gold into your EX area",
          *resolve(fx) {
            yield* fx.tokensToEx([GLITTERING_GOLD, GLITTERING_GOLD]);
          },
        },
      ],
    }),
  ],
});
