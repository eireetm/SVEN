// CP04-052 Nanaka — Runecraft follower, 3, 3/3. プリコネ・トワイライトキャラバン.
// {[ub]}{[fanfare]} Discard a spell: Select an enemy follower on the field and deal it 5 damage. (Not paid, or without an enemy
// follower, it isn't executed — ruling.)
// Once per turn, when a {[ub]} ability of another follower on your field is executed, select a PriConne spell in your cemetery and
// put it into your EX area. (Also in an opponent's turn — ruling.)
import { discardA } from "../costs";
import { defineCard, fanfare, ub, whenAnotherFollowersUnionBurst } from "../helpers";
import { enemyFollower, inYourZone, isSpell } from "../targets";
import { priconneSpell } from "./shared";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        cost: discardA(isSpell),
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        },
      }),
    ),
    whenAnotherFollowersUnionBurst({
      oncePerTurn: true,
      targets: [inYourZone("cemetery", { filter: priconneSpell })],
      *resolve(fx) {
        yield* fx.putIntoEx(fx.targets[0]!);
      },
    }),
  ],
});
