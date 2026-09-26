// BP08-006 Lycoris, Poisoner Princess — Forestcraft follower, 3, 1/3. 植物族・プリンセス.
// Bane.
// During your turn, whenever an enemy follower is put from the field into the cemetery, deal 1
// damage to its leader. (Once per follower; also when this leaves at the same time, CR 10.7.4.2.)
// Activate {[engage]}: Select another follower on your field and give it Bane.
import { activated, defineCard, whenEnemyFollowerToCemetery } from "../helpers";
import { anotherYourFollower } from "../targets";

export default defineCard({
  keywords: ["bane"],
  abilities: [
    whenEnemyFollowerToCemetery(
      {
        *resolve(fx) {
          // "Its leader": the follower was on an enemy field.
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
        },
      },
      { onlyYourTurn: true },
    ),
    activated(
      { engageSelf: true },
      {
        targets: [anotherYourFollower()],
        *resolve(fx) {
          yield* fx.giveKeyword(fx.targets[0]![0]!, "bane");
        },
      },
    ),
  ],
});
