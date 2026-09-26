// BP12-101 Pilgrims' Path — Havencraft amulet, 1. 信仰.
// {[act]} {[cost04]}, bury this card: Give your leader {[defense]}+2. Draw 2 cards.
// {[lastwords]} Summon a Holy Falcon token. (Burying it as the cost triggers it, CR 12.5.1.)
import { activated, defineCard, lastWords } from "../helpers";
import { HOLY_FALCON } from "./shared";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 4, burySelf: true },
      {
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 2);
          yield* fx.draw(2);
        },
      },
    ),
    lastWords({
      *resolve(fx) {
        yield* fx.summon([HOLY_FALCON]);
      },
    }),
  ],
});
