// BP03-032 Rabbit Ear Attendant — Swordcraft follower, 3, 3/4. 童話.
// {[fanfare]} If another Fable follower is on your field, draw a card.
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, fanfare } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const another = (g: GameReader, self: CardId) =>
          g.followers(g.controller(self)).some((id) => id !== self && hasTrait("童話")(g, id));
        if (another(fx.game, fx.self)) yield* fx.draw(1);
      },
    }),
  ],
});
