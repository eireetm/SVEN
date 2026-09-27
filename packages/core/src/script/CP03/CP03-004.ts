// CP03-004 Storm Rider, Basil — Forestcraft follower, 3, 2/2. ヴァンガード・アクアフォース.
// Storm.
// {[fanfare]} Return a 1-cost Aqua Force follower on your field to its owner's hand: You may summon an Aqua Force follower that
// costs 3 or less from your hand. (The cost may be paid without one to summon, and the returned one may be summoned — rulings.
// 元のコスト.)
import { returnAnotherFromYourField } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { costAtMost } from "../targets";
import { aquaForce, followerThat, maySummonFromHand } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      cost: returnAnotherFromYourField((g, id) => followerThat(aquaForce)(g, id) && g.info(id).cost === 1),
      *resolve(fx) {
        yield* maySummonFromHand(fx, (g, id) => followerThat(aquaForce)(g, id) && costAtMost(3)(g, id));
      },
    }),
  ],
});
