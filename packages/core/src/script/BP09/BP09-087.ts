// BP09-087 Jeanne, Beacon of Salvation (Evolved) — Havencraft follower, 3/4. 信仰・先導.
// On Evolve - You may summon a {[havencraft]} follower that costs 2 or less from your hand.
// Strike - Select a {[havencraft]} follower that costs 2 or less on your field and give it
// {[attack]}+1. (元のコスト.)
import { defineCard, onEvolve, strike } from "../helpers";
import { and, costAtMost, isClass, isFollower, yourFollower } from "../targets";
import { summonFromHand } from "./shared";

const smallHaven = and(isClass("Havencraft"), isFollower, costAtMost(2));

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* summonFromHand(fx, smallHaven);
      },
    }),
    strike({
      targets: [yourFollower({ filter: smallHaven })],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 1, 0);
      },
    }),
  ],
});
