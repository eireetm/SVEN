// CP04-033 Mitsuki — Swordcraft follower, 4, 4/4. プリコネ・トワイライトキャラバン.
// {[ub]}{[fanfare]} Select up to 2 enemy followers on the field and give them {[attack]}-2/{[defense]}-2. (With none, it selects 0
// and is executed — ruling.)
// Whenever a {[ub]} ability of another follower on your field is executed, select an enemy follower on the field and give it
// {[attack]}-1/{[defense]}-1. (The English text has "give i".)
import { defineCard, fanfare, ub, whenAnotherFollowersUnionBurst } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        targets: [enemyFollower({ count: 2, upTo: true })],
        *resolve(fx) {
          for (const id of fx.targets[0]!) yield* fx.giveStats(id, -2, -2);
        },
      }),
    ),
    whenAnotherFollowersUnionBurst({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, -1, -1);
      },
    }),
  ],
});
