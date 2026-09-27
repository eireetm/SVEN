// CP04-004 Nephi Nela — Forestcraft follower, 5, 3/4. プリコネ・〈ジオ・ゲヘナ〉.
// {[ub]}{[fanfare]} Select an enemy follower on the field. Deal it 4 damage and put the top card of your deck into your EX area.
// Any 1-cost PriConne follower you play from the EX area costs 1 less. (元のコスト; two Nephi Nelas: 2 less — ruling.)
// Whenever a {[ub]} ability of another follower on your field is executed, put the top card of your deck into your EX area.
import { defineCard, fanfare, ub, whenAnotherFollowersUnionBurst } from "../helpers";
import { enemyFollower } from "../targets";
import { costs, priconneFollower } from "./shared";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 4);
          yield* fx.topToEx(1);
        },
      }),
    ),
    whenAnotherFollowersUnionBurst({
      *resolve(fx) {
        yield* fx.topToEx(1);
      },
    }),
  ],
  field: {
    playCostOf: (g, self, card, player) =>
      player === g.controller(self) && g.playZone(card) === "ex" && priconneFollower(g, card) && costs(1)(g, card) ? -1 : 0,
  },
});
