// BP18-057 Authoring Tomorrow — Runecraft spell, 2. 魔法使い.
// {[act]} {[cost01]}, bury this from your EX area: Deal 1 damage to each enemy follower on the field. (Valid in the EX area;
// not playing a spell — rulings.)
// ----------
// {[quick]}
// Draw a card. If this was played from hand, put it into your EX area. (With a full EX area it goes to the cemetery —
// ruling, CR 4.8.3.2, 10.6.2.8.2.3.)
import { activated, defineCard, spell } from "../helpers";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    activated(
      { playPoints: 1, burySelf: true },
      {
        validIn: ["ex"],
        *resolve(fx) {
          yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 1);
        },
      },
    ),
    spell({
      *resolve(fx) {
        yield* fx.draw(1);
        if (fx.game.playZone(fx.self) === "hand") yield* fx.putIntoEx([fx.self]);
      },
    }),
  ],
});
