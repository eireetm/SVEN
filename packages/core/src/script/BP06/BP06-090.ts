// BP06-090 Wilbert, Grand Knight — Havencraft follower, 5, 4/5. 挑戦者・先導.
// Ward.
// {[fanfare]} Look at the top 5 cards of your deck. From among them, you may summon a follower with
// Ward not named Wilbert, Grand Knight that costs 5 or less. Put the rest on the bottom of your deck
// in any order.
// Whenever a follower with Ward is put from your field into the cemetery, deal 1 damage to each
// enemy leader. (Wilbert itself too, a given Ward too, destroyed or reserved alike; each one
// separately — rulings. Ward as it had on the field, CR 10.7.4.1.2.)
import { defineCard, fanfare, lookAtTopCards, whenYourFollowerLeaves } from "../helpers";
import { and, costAtMost, isFollower, named } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 5, {
          filter: and(isFollower, costAtMost(5), (g, id) => g.info(id).keywords.includes("ward") && !named("Wilbert, Grand Knight")(g, id)),
          to: "field",
        });
      },
    }),
    whenYourFollowerLeaves(
      {
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
        },
      },
      { to: "cemetery", includeSelf: true, filter: (m) => m.before?.keywords?.includes("ward") === true },
    ),
  ],
});
