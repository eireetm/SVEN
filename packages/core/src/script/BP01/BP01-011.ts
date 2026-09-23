// BP01-011 Blessed Fairy Dancer — Forestcraft follower, 2, 2/3.
// {[fanfare]} Give +1/+1 to each other Pixie follower on your field and in your EX area.
// (Given to EX area cards, the +1/+1 stays when they are played / put onto the field — ruling,
// CR 4.8.3.3.)
import { defineCard, fanfare } from "../helpers";
import { and, hasTrait, isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const pixie = and(isFollower, hasTrait("妖精"));
        const cards = [...fx.game.cards(fx.controller, "field"), ...fx.game.cards(fx.controller, "ex")];
        for (const id of cards) if (id !== fx.self && pixie(fx.game, id)) yield* fx.giveStats(id, 1, 1);
      },
    }),
  ],
});
