// BP20-022 Aurelia, Glorious Saber — Swordcraft follower, 5, 3/4. 指揮官・プリンセス.
// This costs X less to play. X equals the number of {[swordcraft]} cards on your field.
// Rush. Assail. Ward.
// Strike - Draw a card.
import { defineCard, strike } from "../helpers";
import { isClass } from "../targets";

export default defineCard({
  keywords: ["rush", "assail", "ward"],
  playCost: (g, _self, controller) => -g.cards(controller, "field").filter((id) => isClass("Swordcraft")(g, id)).length,
  abilities: [
    strike({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
