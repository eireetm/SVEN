// BP04-124 Goblin Princess — Neutral follower, 3, 2/1. ゴブリン・プリンセス.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Search your deck for a Neutral follower that costs 1 play point and put it onto your
// field.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isClass, isFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.search(
          (id) => isFollower(fx.game, id) && isClass("Neutral")(fx.game, id) && fx.game.info(id).cost === 1,
          { to: "field" },
        );
      },
    }),
  ],
});
