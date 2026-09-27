// ECP02-011 Blossoms' Advance — Forestcraft spell, 5. デレマス・パッション.
// You may summon a Passion follower that costs 6 or less from your hand. Put a Magical Item token into your EX area. (元のコスト.)
import { defineCard, spell } from "../helpers";
import { costAtMost } from "../targets";
import { followerThat, magicalItems, maySummonFromHand, passion } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* maySummonFromHand(fx, (g, id) => followerThat(passion)(g, id) && costAtMost(6)(g, id));
        yield* magicalItems(fx);
      },
    }),
  ],
});
