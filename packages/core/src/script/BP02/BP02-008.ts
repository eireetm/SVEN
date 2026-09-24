// BP02-008 Crystalia Lily — Forestcraft follower, 2, 1/3.
// {[evolve]}{[cost02]}: Evolve this follower.
// {[fanfare]} Look at the top 2 cards of your deck. You may reveal a Crystalian or Pixie follower
// from among them and add it to your hand. Put the remaining cards on the bottom of your deck in
// any order.
import { defineCard, evolveAbility, fanfare, lookAtTopCards } from "../helpers";
import { hasTrait, isFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        const filter = (g: typeof fx.game, id: string) =>
          isFollower(g, id) && (hasTrait("クリスタリア")(g, id) || hasTrait("妖精")(g, id));
        yield* lookAtTopCards(fx, 2, { filter, to: "hand" });
      },
    }),
  ],
});
