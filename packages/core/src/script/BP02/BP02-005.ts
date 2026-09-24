// BP02-005 Elf Knight Cynthia — Forestcraft follower, 5, 5/5.
// Rush.
// Strike, banish a card in your EX area: Select an enemy leader or enemy follower on the field.
// Deal it 2 damage and summon 2 Fairy tokens. (An automatic ability with a cost, CR 10.4.7.4;
// only cards in your own EX area can pay it — ruling.)
import { defineCard, strike } from "../helpers";
import { banishFromYourEx } from "../costs";
import { enemyLeaderOrFollower } from "../targets";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    strike({
      cost: banishFromYourEx(() => true),
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        yield* fx.summon(["Fairy", "Fairy"]);
      },
    }),
  ],
});
