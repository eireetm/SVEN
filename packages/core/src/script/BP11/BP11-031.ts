// BP11-031 Naht's Henchman — Swordcraft follower, 1, 2/2. 荒野・兵士.
// This card costs 1 less to play from the EX area if there's a Nahtnaught, Cursed Queen on your field.
// ----------
// {[fanfare]} If there's a Nahtnaught, Cursed Queen on your field, draw a card.
import { defineCard, fanfare } from "../helpers";
import { onYourField } from "./shared";

const NAHT = "Nahtnaught, Cursed Queen";

export default defineCard({
  playCost: (g, self, c) => (g.playZone(self) === "ex" && onYourField(g, c, NAHT) ? -1 : 0),
  abilities: [
    fanfare({
      condition: (g, p) => onYourField(g, p, NAHT),
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
