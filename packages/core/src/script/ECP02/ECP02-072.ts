// ECP02-072 Curtain Call of Smiles — Neutral spell, 12. デレマス・キュート・クール・パッション.
// This costs 5 less to play if there are at least 10 iM@S CG cards in your cemetery.
// ----------
// Destroy each non-iM@S CG follower on the field. Put 2 Magical Item tokens into your EX area. Give your leader {[defense]}+4. Draw 2
// cards. (With a full EX area no Magical Item is put there, the rest still happens; its types count as each of Cute, Cool and
// Passion — rulings.)
import { defineCard, spell } from "../helpers";
import { imas, inYourCemetery, magicalItems } from "./shared";

export default defineCard({
  playCost: (g, _self, c) => (inYourCemetery(g, c, imas) >= 10 ? -5 : 0),
  abilities: [
    spell({
      *resolve(fx) {
        const g = fx.game;
        const all = [...g.followers(fx.controller), ...g.followers(g.opponent(fx.controller))];
        yield* fx.destroy(all.filter((id) => !imas(g, id)));
        yield* magicalItems(fx, 2);
        yield* fx.giveLeaderDefense(fx.controller, 4);
        yield* fx.draw(2);
      },
    }),
  ],
});
